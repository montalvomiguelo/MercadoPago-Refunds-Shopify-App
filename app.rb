class App < Sinatra::Base
  register WillPaginate::Sinatra

  enable :sessions
  enable :inline_templates
  enable :method_override

  set :erb, :layout => :'layouts/application'
  set :protection, except: :frame_options

  set :api_key, ENV['SHOPIFY_API_KEY']
  set :shared_secret, ENV['SHOPIFY_SHARED_SECRET']
  set :per_page, 30

  use OmniAuth::Builder do
    provider :shopify, ENV['SHOPIFY_API_KEY'], ENV['SHOPIFY_SHARED_SECRET'], scope: 'read_orders,write_orders'
  end

  ShopifyAPI::Session.setup(api_key: settings.api_key, secret: settings.shared_secret)

  helpers ShopifyHelpers

  get '/install' do
    erb :install, layout: false
  end

  post '/login' do
    authenticate
  end

  get '/auth/shopify/callback' do
    shop_name = params[:shop]
    token = request.env['omniauth.auth']['credentials']['token']

    shop = Shop.update_or_create({name: shop_name}, token: token)

    session[:shopify] = {
      shop: shop_name,
      token: token
    }

    return_to = env['omniauth.params']['return_to']
    redirect return_to
  end

  get '/' do
    shopify_session do
      page = params[:page] || 1
      total = ShopifyAPI::Order.count
      per_page = settings.per_page

      @orders = ShopifyAPI::Order.find(:all, params: { limit: per_page, page: page })

      @paged = @orders.paginate(:page => page, :per_page => per_page, :total_entries => total)

      erb :home
    end
  end

  get '/orders/:id' do
    shopify_session do
      begin
        @order = ShopifyAPI::Order.find(params[:id])
      rescue ActiveResource::ResourceNotFound => e
        halt 404, "Order #{params[:id]} not found"
      end

      erb :order
    end
  end

  post '/orders/:id/refunds' do
    shopify_session do
      @shop = current_shop

      mercado_pago = MercadoPago.new(@shop.mp_client_id, @shop.mp_client_secret)

      begin
        mercado_pago.get_access_token
      rescue RuntimeError => e
        halt 401, 'Invalid client_id or client_secret'
      end

      # Get the payment
      checkout_id = params[:refund][:checkout_id]

      response = mercado_pago.get("/collections/search?external_reference=#{checkout_id}")['response']

      payment = response['results'].first

      unless payment
        halt 404, "Payment with external_reference #{checkout_id} not found"
      end

      # Issue partial refund in Mercado Pago
      payment_id = payment['collection']['id']

      data = {
        :amount => params[:refund][:amount],
        :metadata => {
          :reason => params[:refund][:note],
          :external_reference => checkout_id
        }
      }

      refund_mercado_pago = mercado_pago.post("/collections/#{payment_id}/refunds", data)

      halt 422, 'Invalid amount' if refund_mercado_pago['status'] == '400'

      # Create refund in Shopify
      begin
        refund = ShopifyAPI::Refund.create(
          :order_id => params[:id],
          :restock => params[:refund][:restock],
          :notify => params[:refund][:notify],
          :note => params[:refund][:note],
          :refund_line_items => params[:refund][:refund_line_items]
        )
      rescue ActiveResource::ResourceNotFound => e
        halt 404, "Order #{params[:id]} not found"
      end

      redirect "/"
    end
  end

  get '/preferences' do
    shopify_session do
      @shop = current_shop

      erb :preferences
    end
  end

  put '/shop' do
    shopify_session do
      shop = current_shop

      shop.mp_client_id = params[:client_id]
      shop.mp_client_secret = params[:client_secret]

      shop.save

      redirect '/preferences'
    end
  end
end
