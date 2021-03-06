require 'test_helper'

class TestApp < Minitest::Test
  def app
    App
  end

  def setup
    @shop_name = 'snowdevil.myshopify.com'

    @base_url = 'https://app.example.com'

    @refund_payload = {
      :refund => {
        :shipping => { :full_refund => true },
        :refund_line_items => [
          {
            :line_item_id => 466157049,
            :quantity => 1
          }
        ],
        :amount => 199
      }
    }

    @mp = MercadoPago.new('23', 'qwer')

    DatabaseCleaner.start
  end

  def teardown
    DatabaseCleaner.clean
  end

  def test_installation_page_returns_success
    get '/install'
    assert last_response.ok?
  end

  def test_login_authenticates_the_shop
    App.any_instance.expects(:authenticate)
    post '/login', {:shop => @shop_name}
  end

  def test_authenticate_sanitizes_the_shop_name
    App.any_instance.expects(:sanitize_shop_param).returns(@shop_name)
    post '/login', {:shop => @shop_name}
  end

  def test_authenticate_with_invalid_shop_name_redirects_to_login
    post '/login', {:shop => 'https://shopify.com'}
    follow_redirect!
    assert_match 'Install', last_response.body
  end

  def test_authenticate_redirects_to_shopiy_auth_via_javascript
    App.any_instance.expects(:base_url).returns(@base_url)
    App.any_instance.expects(:redirect_javascript)
    post '/login', {:shop => @shop_name}
  end

  def test_callback_persists_shop_in_database
    mock_shopify_omniauth

    Shop.expects(:update_or_create)

    get '/auth/shopify/callback', {:shop => @shop_name}
  end

  def test_callback_creates_a_session_for_the_shop
    mock_shopify_omniauth

    get '/auth/shopify/callback', {:shop => @shop_name}

    refute_nil last_request.session[:shopify]
    assert_equal @shop_name, last_request.session[:shopify][:shop]
    assert_equal '1234', last_request.session[:shopify][:token]
  end

  def test_callback_redirects_to_root_path
    mock_shopify_omniauth

    fake "https://#{@shop_name}/admin/orders.json?limit=10", body: load_fixture('orders.json')
    fake "https://#{@shop_name}/admin/orders/450789469/metafields.json", body: load_fixture('metafields.json')

    get '/auth/shopify/callback', {:shop => @shop_name}

    follow_redirect!
    assert last_response.ok?
  end

  def test_root_with_session
    set_session
    fake "https://#{@shop_name}/admin/orders.json?limit=10", body: load_fixture('orders.json')
    fake "https://#{@shop_name}/admin/orders/450789469/metafields.json", body: load_fixture('metafields.json')
    get '/'
    assert last_response.ok?
  end

  def test_root_with_session_activates_api
    set_session
    App.any_instance.expects(:activate_shopify_api).with(@shop_name, '1234')
    get '/'
    assert last_response.ok?
  end

  def test_root_without_session_redirects_to_install
    get '/'
    follow_redirect!
    assert last_response.body.include?('Install')
  end

  def test_root_with_shop_redirects_to_auth
    App.any_instance.expects(:redirect_javascript)
    get '/?shop=othertestshop.myshopify.com'
  end

  def test_root_path_delivers_app_view
    set_session
    get '/'
    assert last_response.body.include?('root')
  end

  def test_single_order_route_returns_json_data
    fake "https://#{@shop_name}/admin/orders/450789469.json", body: load_fixture('order.json')
    fake "https://#{@shop_name}/admin/orders/450789469/metafields.json", body: load_fixture('metafields.json')
    set_session
    get '/orders/450789469'
    assert last_response.ok?
    assert last_response.content_type.include?('application/json')
  end

  def test_post_calculate_refund_returns_json_data
    set_session

    payload = {
      :refund => {
        :shipping => { :full_refund => true },
        :refund_line_items => [
          {
            :line_item_id => 466157049,
            :quantity => 1
          }
        ]
      }
    }

    fake "https://#{@shop_name}/admin/orders/450789469/refunds/calculate.json", {:method => :post, :body => load_fixture('suggested_refund.json')}
    fake "https://#{@shop_name}/admin/orders/450789469.json", body: load_fixture('order.json')

    post '/orders/450789469/refunds/calculate', payload.to_json

    assert last_response.content_type.include?('application/json')
    assert last_response.body.include?('refund_line_items')
  end

  def test_invalid_refund_calculation_returns_422
    set_session

    payload = {
      :refund => {
        :shipping => { :amount => 999999.0 },
      }
    }

    ShopifyAPI::Refund.stubs(:calculate).raises(ActiveResource::ResourceInvalid, 'message')

    fake "https://#{@shop_name}/admin/orders/450789469.json", body: load_fixture('order.json')

    post '/orders/450789469/refunds/calculate', payload.to_json

    assert_equal 422, last_response.status
    assert last_response.content_type.include?('application/json')
  end

  def test_refund_creates_mercadopago_client
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)

    MercadoPago.expects(:new).returns(@mp)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_mercadopago_credentials_are_verified
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    MercadoPago.any_instance.expects(:get_access_token).returns('APP_USR-23').at_least_once

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_invalid_mercadopago_credentials_halts_401
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    MercadoPago.any_instance.stubs(:get_access_token).raises(RuntimeError, 'message').at_least_once

    post '/orders/450789469/refunds', @refund_payload.to_json

    assert_equal 401, last_response.status
  end

  def test_retrieving_the_payment_from_mercadopago
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    payment_results = {
      'response' => {
        'results' => [
          {
            'collection' => {
              'id' => '3535309354'
            }
          }
        ]
      }
    }

    MercadoPago.any_instance.expects(:get).returns(payment_results)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_no_payment_results_halt_404
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    payment_results = {
      'response' => {
        'results' => []
      }
    }

    MercadoPago.any_instance.stubs(:get).returns(payment_results)

    post '/orders/450789469/refunds', @refund_payload.to_json

    assert_equal 404, last_response.status
  end

  def test_issue_a_refund_in_mercadopago
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    transaction = {
      'status' => '201',
      'response' => {
        'amount' => '199'
      }
    }

    MercadoPago.any_instance.expects(:post).returns(transaction)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_invalid_transaction_halt_422
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    transaction = {
      'status' => '400',
      'response' => {}
    }

    MercadoPago.any_instance.stubs(:post).returns(transaction)

    post '/orders/450789469/refunds', @refund_payload.to_json

    assert_equal 422, last_response.status
  end

  def test_order_persists_refunded_amount
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    metafields = {
      'metafields' => [
        {
          'id' => 1352251342860,
          'namespace': 'mercadopago',
          'key': 'refund_amount',
          'value': '119192',
        }
      ]
    }

    ShopifyAPI::Order.any_instance.expects(:persist_refund_amount).returns(metafields)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_add_tags_to_order
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    ShopifyAPI::Order.any_instance.expects(:tags_string)
    ShopifyAPI::Order.any_instance.expects(:save)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_create_refund_in_shopify
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    shopify_refund = mock()
    shopify_refund.expects(:valid?).returns(true)
    shopify_refund.expects(:as_json).returns('{}')
    ShopifyAPI::Refund.expects(:create).returns(shopify_refund)

    post '/orders/450789469/refunds', @refund_payload.to_json
  end

  def test_create_refund_in_shopify_with_invalid_params_halt_422
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    fake_refund_requests

    App.any_instance.stubs(:current_shop).returns(shop)
    MercadoPago.stubs(:new).returns(@mp)

    shopify_refund = mock()
    ShopifyAPI::Refund.expects(:create).raises(ActiveResource::ServerError, 'message')

    post '/orders/450789469/refunds', @refund_payload.to_json

    assert 422, last_response.status
  end

  def test_get_shop_in_json
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    App.any_instance.expects(:current_shop).returns(shop)

    get '/shop'

    assert last_response.ok?
    assert last_response.content_type.include?('application/json')
    assert last_response.body.include?(@shop_name)
  end

  def test_update_mercadopago_credentials_in_shop
    set_session

    shop = create(:shop, name: @shop_name, token: '1234', mp_client_id: '23', mp_client_secret: 'qwert')

    client_id = 'hello'
    client_secret = 'diana'

    App.any_instance.stubs(:current_shop).returns(shop)

    payload = {
      client_id: client_id,
      client_secret: client_secret
    }

    put '/shop', payload.to_json

    shop.reload

    assert_equal client_id, shop.mp_client_id
    assert_equal client_secret, shop.mp_client_secret
  end

  private

    def fake_refund_requests
      fake "https://api.mercadopago.com/oauth/token", {:method => :post, :body => load_fixture('mercadopago_auth.json')}
      fake "https://api.mercadopago.com/collections/3535309354/refunds?access_token=APP_USR-23", {:method => :post, :body => load_fixture('refund.json')}
      fake "https://#{@shop_name}/admin/orders/450789469.json", body: load_fixture('order.json')
      fake "https://api.mercadopago.com/collections/search?external_reference=901414060&access_token=APP_USR-23", body: load_fixture('payment.json')
      fake "https://#{@shop_name}/admin/orders/450789469/metafields/1352251342860.json", {:method => :put}
      fake "https://#{@shop_name}/admin/orders/450789469.json", {:method => :put}
      fake "https://#{@shop_name}/admin/orders/450789469/refunds.json", {:method => :post}
      fake "https://#{@shop_name}/admin/orders/450789469/metafields.json", body: load_fixture('metafields.json')
    end

    def set_session(shop = @shop_name, token = '1234')
      App.any_instance.stubs(:session).returns(shopify: { shop: shop, token: token })
    end

    def mock_shopify_omniauth
      OmniAuth.config.test_mode = true

      OmniAuth.config.mock_auth[:shopify] = OmniAuth::AuthHash.new({
        :provider => 'shopify',
        :uid => @shop_name,
        :credentials => { :token => '1234' }
      })

      env "omniauth.auth", OmniAuth.config.mock_auth[:shopify]
      env "rack.session", { 'omniauth.params' => { 'return_to' => '/' } }
    end

end
