ENV['RACK_ENV'] = 'test'

require 'bundler'
Bundler.require(:default, :test)

require_relative '../app'

describe App do
  include Rack::Test::Methods

  def app
    App
  end

  describe 'GET /install' do
    it 'responds with 200 OK' do
      get '/install'
      expect(last_response).to be_ok
    end

    it 'shows a form to enter the shop' do
      get '/install'
      expect(last_response.body).to include('Shopify App - Installation')
      expect(last_response.body).to include('form')
      expect(last_response.body).to include('input type="text"')
    end
  end
end
