class App < Sinatra::Base
  enable :sessions

  use OmniAuth::Builder do
    provider :shopify, ENV['SHOPIFY_API_KEY'], ENV['SHOPIFY_SHARED_SECRET'], :scope => 'read_orders, write_orders'
  end

  helpers do
    def base_url
      @base_url ||= request.base_url
    end
  end

  get '/install' do
    erb :install
  end

  post '/login' do
    authenticate
  end

  get '/auth/shopify/callback' do
    shop_name = params[:shop]
  end

  private

  def authenticate(return_to = '/')
    if shop_name = sanitized_shop_name
      redirect "/auth/shopify?shop=#{shop_name}&return_to=#{base_url}#{return_to}"
    else
      redirect '/install'
    end
  end

  def sanitized_shop_name
    @sanitized_shop_name ||= sanitize_shop_params(params)
  end

  def sanitize_shop_params(params)
    return unless params[:shop]

    name = params[:shop].to_s.strip
    name += '.myshopify.com' if !name.include?('myshopify.com') && !name.include?('.')
    name.gsub!('https://', '')
    name.gsub!('http://', '')

    uri = URI("http://#{name}")
    uri.host.end_with?('.myshopify.com') ? uri.host : nil
  end
end
