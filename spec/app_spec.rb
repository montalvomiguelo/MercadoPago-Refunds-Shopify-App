ENV['RACK_ENV'] = 'test'

require 'bundler'
Bundler.require(:default, :test)

require_relative '../app'

describe App do
  include Rack::Test::Methods

  def app
    App
  end

  it "says the app is running" do
    get '/'
    expect(last_response).to be_ok
    expect(last_response.body).to eq('The application is running')
  end
end
