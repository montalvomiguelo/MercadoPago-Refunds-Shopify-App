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

  helpers ShopifyHelper

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

      erb :'orders/index'
    end
  end

  get '/orders/:id' do
    shopify_session do

      # Verify order exists
      begin
        @order = ShopifyAPI::Order.find(params[:id])
      rescue ActiveResource::ResourceNotFound => e
        halt 404, "Order #{params[:id]} not found"
      end

      erb :'orders/show'
    end
  end

  post '/orders/:id/refunds/calculate' do
    shopify_session do

      # Verify order exists
      begin
        @order = ShopifyAPI::Order.find(params[:id])
      rescue ActiveResource::ResourceNotFound => e
        halt 404, 'Order not found'
      end

      data = {
        :shipping => { :amount => params[:refund][:shipping][:amount] },
        :refund_line_items => params[:refund][:refund_line_items]
      }

      begin
        @refund = ShopifyAPI::Refund.calculate(data, :params => {:order_id => params[:id]})
      rescue ActiveResource::ResourceInvalid => e
        halt 422, 'Invalid refund'
      end

      erb :'orders/refund'
    end
  end

  post '/orders/:id/refunds' do
    shopify_session do

      @shop = current_shop

      # Verify order exists
      begin
        @order = ShopifyAPI::Order.find(params[:id])
      rescue ActiveResource::ResourceNotFound => e
        halt 404, 'Order not found'
      end

      # Verify MercadoPago credentials
      mercadopago = MercadoPago.new(@shop.mp_client_id, @shop.mp_client_secret)

      begin
        mercadopago.get_access_token
      rescue RuntimeError => e
        halt 401, 'Invalid client_id or client_secret'
      end

      # Get the payment
      checkout_id = @order.checkout_id

      response = mercadopago.get("/collections/search?external_reference=#{checkout_id}")['response']

      payment = response['results'].first

      halt 404, "Payment with external_reference #{checkout_id} not found" unless payment

      # Issue partial refund in MercadoPago
      payment_id = payment['collection']['id']

      data = {
        :amount => params[:refund][:amount],
        :metadata => {
          :reason => params[:refund][:note],
          :external_reference => checkout_id
        }
      }

      transaction = mercadopago.post("/collections/#{payment_id}/refunds", data)

      halt 422, 'Invalid amount' if transaction['status'] == '400'

      # Store refund amount in metafield
      @order.persist_refund_amount(transaction['response']['amount'])

      # Create refund in Shopify
      begin
        refund = ShopifyAPI::Refund.create(
          :order_id => params[:id],
          :restock => params[:refund][:restock],
          :notify => params[:refund][:notify],
          :note => params[:refund][:note],
          :shipping => { :amount => params[:refund][:shipping][:amount] },
          :refund_line_items => params[:refund][:refund_line_items],
          :transactions => []
        )
      rescue ActiveResource::ServerError => e
        halt 422, 'Invalid refund params'
      end

      halt 422, 'Invalid refund' unless refund.valid?

      redirect "/orders/#{params[:id]}"
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
