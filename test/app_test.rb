require File.expand_path('../test_helper', __FILE__)

class TestApp < Minitest::Test
  def app
    App
  end

  def setup
    @shop_name = 'snowdevil.myshopify.com'
  end

  def test_root_with_session
    set_session
    fake 'https://snowdevil.myshopify.com/admin/orders/count.json', body: '{"count": 16}'
    fake 'https://snowdevil.myshopify.com/admin/orders.json?limit=30&page=1', body: load_fixture('orders.json')
    get '/'
    assert last_response.ok?
  end

  private

    def set_session(shop = 'snowdevil.myshopify.com', token = 'token')
      App.any_instance.stubs(:session).returns(shopify: { shop: shop, token: token })
    end

end
