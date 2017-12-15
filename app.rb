class App < Sinatra::Base
  enable :sessions
  enable :inline_templates
  enable :method_override

  set :erb, :layout => :'layouts/application'
  set :api_key, ENV['SHOPIFY_API_KEY']
  set :shared_secret, ENV['SHOPIFY_SHARED_SECRET']
  set :protection, except: :frame_options

  use OmniAuth::Builder do
    provider :shopify,
             ENV['SHOPIFY_API_KEY'],
             ENV['SHOPIFY_SHARED_SECRET'],
             :scope => 'read_orders, write_orders',
             setup: lambda { |env|
               params = Rack::Utils.parse_query(env['QUERY_STRING'])
               site_url = "https://#{params['shop']}"
               env['omniauth.strategy'].options[:client_options][:site] = site_url
             }
  end

  ShopifyAPI::Session.setup(api_key: settings.api_key, secret: settings.shared_secret)

  helpers do
    def base_url
      @base_url ||= request.base_url
    end

    def current_shop
      Shop.find(name: current_shop_name)
    end

    def current_shop_name
      return session[:shopify][:shop] if session.key?(:shopify)
      return @shop_name if @shop_name
    end

    def current_shop_url
      "https://#{current_shop_name}" if current_shop_name
    end

    def shopify_session(&block)
      return_to = request.env['sinatra.route'].split(' ').last

      if !session.key?(:shopify)
        authenticate(return_to)
      elsif params[:shop] && session[:shopify][:shop] != sanitize_shop_param(params)
        logout
        authenticate(return_to)
      else
        shop_name = session[:shopify][:shop]
        token = session[:shopify][:token]
        activate_shopify_api(shop_name, token)
        block.call
      end
    end

    def logout
      session.delete(:shopify)
    end

    def activate_shopify_api(shop_name, token)
      api_session = ShopifyAPI::Session.new(shop_name, token)
      ShopifyAPI::Base.activate_session(api_session)
    end
  end

  get '/install' do
    erb :install, layout: false
  end

  post '/login' do
    authenticate
  end

  get '/auth/shopify/callback' do
    shop_name = params[:shop]
    token = request.env['omniauth.auth']['credentials']['token']

    shop = Shop.find_or_create(name: shop_name) { |s| s.token = token }

    session[:shopify] = {
      shop: shop_name,
      token: token
    }

    return_to = env['omniauth.params']['return_to']
    redirect return_to
  end

  get '/' do
    shopify_session do
      @orders = ShopifyAPI::Order.find(:all, params: { limit: 10 })
      erb :home
    end
  end

  get '/order/:id' do
    shopify_session do
      @order = ShopifyAPI::Order.find(params[:id])
      erb :order
    end
  end

  post '/refund/:id' do
    shopify_session do

      data = {
        :order_id => params[:id],
        :restock => params[:refund][:restock],
        :notify => params[:refund][:notify],
        :note => params[:refund][:note],
        :refund_line_items => params[:refund][:refund_line_items]
      }

      @refund = ShopifyAPI::Refund.create(data)

      @refund.inspect
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
