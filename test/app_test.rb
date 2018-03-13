require 'test_helper'

class TestApp < Minitest::Test
  def app
    App
  end

  def setup
    @shop_name = 'snowdevil.myshopify.com'
    @base_url = 'https://app.example.com'
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
    assert_match 'Order', last_response.body
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
    ShopifyAPI::Order.expects(:find).returns([])
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

  def test_orders_route_delivers_app_view
    set_session
    get '/orders'
    assert last_response.body.include?('bundle.js')
  end

  def test_single_order_route_returns_json_data
    fake "https://#{@shop_name}/admin/orders/450789469.json", body: load_fixture('order.json')
    fake "https://#{@shop_name}/admin/orders/450789469/metafields.json", body: load_fixture('metafields.json')
    set_session
    get '/orders/450789469'
    assert last_response.ok?
    assert last_response.content_type.include?('application/json')
  end

  private

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
