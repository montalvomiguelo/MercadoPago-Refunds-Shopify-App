class App < Sinatra::Base
  register WillPaginate::Sinatra

  enable :sessions
  enable :inline_templates
  enable :method_override

  set :erb, :layout => :'layouts/application'
  set :api_key, ENV['SHOPIFY_API_KEY']
  set :shared_secret, ENV['SHOPIFY_SHARED_SECRET']
  set :protection, except: :frame_options
  set :per_page, 30

  use OmniAuth::Builder do
    provider :shopify,
             ENV['SHOPIFY_API_KEY'],
             ENV['SHOPIFY_SHARED_SECRET'],
             scope: 'read_orders,write_orders',
             setup: lambda { |env|
               params = Rack::Utils.parse_query(env['QUERY_STRING'])
               site_url = "https://#{params['shop']}"
               env['omniauth.strategy'].options[:client_options][:site] = site_url
             }
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
      total_entries = ShopifyAPI::Order.count
      per_page = settings.per_page

      @orders = ShopifyAPI::Order.find(:all, params: { limit: per_page, page: page })

      @paged = @orders.paginate(:page => page, :per_page => per_page, :total_entries => total_entries)

      erb :home
    end
  end

  get '/orders/:id' do
    shopify_session do
      @order = ShopifyAPI::Order.find(params[:id])
      erb :order
    end
  end

  post '/refunds/:id' do
    shopify_session do
      @shop = current_shop

      mercado_pago = MercadoPago.new(@shop.mp_client_id, @shop.mp_client_secret)

      begin
        mercado_pago.get_access_token
      rescue => e
        halt 422, 'Invalid client_id or client_secret'
      end

      # Get the payment
      checkout_id = params[:refund][:checkout_id]

      response = mercado_pago.get("/collections/search?external_reference=#{checkout_id}")['response']

      begin
        payment = response['results'].first
      rescue => e
        halt 422, "Payment with external_reference #{checkout_id} not found"
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
      rescue => e
        halt 422, "Order #{params[:id]} not found"
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

      halt 400, 'Shop not found' unless shop

      shop.mp_client_id = params[:client_id]
      shop.mp_client_secret = params[:client_secret]

      shop.save

      redirect '/preferences'
    end
  end

  private

  def authenticate(return_to = '/')
    if shop_name = sanitized_shop_name
      redirect_url = "/auth/shopify/?shop=#{shop_name}&return_to=#{base_url}#{return_to}"
      redirect_javascript(redirect_url)
    else
      redirect '/install'
    end
  end

  def sanitized_shop_name
    @sanitized_shop_name ||= sanitize_shop_param(params)
  end

  def sanitize_shop_param(params)
    return unless params[:shop]

    name = params[:shop].to_s.strip
    name += '.myshopify.com' if !name.include?('myshopify.com') && !name.include?('.')
    name.gsub!('https://', '')
    name.gsub!('http://', '')

    uri = URI("http://#{name}")
    uri.host.end_with?('.myshopify.com') ? uri.host : nil
  end

  def clear_session(shop)
    logout
    shop.token = nil
    shop.save
  end

  def redirect_javascript(url)
    erb %(
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <base target="_top">
        <title>Redirecting…</title>

        <script type='text/javascript'>
          // If the current window is the 'parent', change the URL by setting location.href
          if (window.top == window.self) {
            window.top.location.href = #{url.to_json};

          // If the current window is the 'child', change the parent's URL with postMessage
          } else {
            message = JSON.stringify({
              message: 'Shopify.API.remoteRedirect',
              data: { location: window.location.origin + #{url.to_json} }
            });
            window.parent.postMessage(message, 'https://#{sanitized_shop_name}');
          }
        </script>
      </head>
      <body>
      </body>
    </html>
    ), layout: false
  end
end
