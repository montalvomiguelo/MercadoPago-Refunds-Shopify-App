class App < Sinatra::Base
  enable :sessions
  enable :inline_templates
  enable :method_override

  set :protection, :except => :frame_options

  set :api_key, ENV['SHOPIFY_API_KEY']
  set :shared_secret, ENV['SHOPIFY_SHARED_SECRET']

  set :tag_partially_refunded, 'MercadoPago Partially Refunded'
  set :tag_refunded, 'MercadoPago Refunded'

  configure :development do
    register Sinatra::Reloader
  end

  use OmniAuth::Builder do
    provider :shopify, ENV['SHOPIFY_API_KEY'], ENV['SHOPIFY_SHARED_SECRET'], scope: 'read_orders,write_orders'
  end

  ShopifyAPI::Session.setup(api_key: settings.api_key, secret: settings.shared_secret)

  helpers ShopifyHelper, OrderHelper

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

  get '/orders' do
    shopify_session do
      @orders = ShopifyAPI::Order.find(:all, params: { limit: 10 })

      json @orders
    end
  end

  get '/orders/:id' do
    shopify_session do

      find_order!

      @order.total_refund = @order.total_refund.to_s

      json @order
    end
  end

  post '/orders/:id/refunds/calculate' do
    shopify_session do

      request.body.rewind
      request_payload = request.body.read

      find_order!

      data = JSON.parse(request_payload)

      begin
        @refund = ShopifyAPI::Refund.calculate(data['refund'], :params => {:order_id => params[:id]})
      rescue ActiveResource::ResourceInvalid => e
        halt 422, {'Content-Type' => 'application/json'}, 'Invalid refund'
      end

      json @refund
    end
  end

  post '/orders/:id/refunds' do
    shopify_session do

      request.body.rewind
      request_payload = request.body.read

      refund_data = JSON.parse(request_payload)

      @shop = current_shop

      find_order!

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
        :amount => refund_data['refund']['amount'],
        :metadata => {
          :reason => refund_data['refund']['note'],
          :external_reference => checkout_id
        }
      }

      transaction = mercadopago.post("/collections/#{payment_id}/refunds", data)

      halt 422, transaction['response']['message'] if transaction['status'] == '400'

      # Store refund amount in metafield
      @order.persist_refund_amount(transaction['response']['amount'])

      # Add order tags
      if @order.refunded?
        @order.tags_remove(settings.tag_partially_refunded)
        @order.tags_list << settings.tag_refunded
      else
        @order.tags_list << settings.tag_partially_refunded unless @order.tags_include?(settings.tag_partially_refunded)
      end

      @order.tags = @order.tags_string

      @order.save

      # Create refund in Shopify
      begin
        refund = ShopifyAPI::Refund.create(
          :order_id => params[:id],
          :restock => refund_data['refund']['restock'],
          :notify => refund_data['refund']['notify'],
          :note => refund_data['refund']['note'],
          :shipping => { :amount => refund_data['refund']['shipping']['amount'] },
          :refund_line_items => refund_data['refund']['refund_line_items'],
          :transactions => []
        )
      rescue ActiveResource::ServerError => e
        halt 422, 'Invalid refund params'
      end

      halt 422, 'Invalid refund' unless refund.valid?

      json refund
    end
  end

  get '/shop' do
    shopify_session do
      @shop = current_shop
      @shop['mp_secret'] = @shop.mp_client_secret

      json @shop
    end
  end

  put '/shop' do
    shopify_session do
      @shop = current_shop

      request.body.rewind
      data = JSON.parse(request.body.read)

      @shop.mp_client_id = data['client_id']
      @shop.mp_client_secret = data['client_secret']

      @shop.save

      @shop.refresh
      @shop['mp_secret'] = @shop.mp_client_secret

      json @shop
    end
  end

  get '/*' do
    shopify_session do
      erb :app, layout: false
    end
  end
end
