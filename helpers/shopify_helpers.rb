module ShopifyHelpers
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
  rescue ActiveResource::UnauthorizedAccess
    clear_session current_shop
    redirect request.env['sinatra.route'].split(' ').last
  end

  def logout
    session.delete(:shopify)
  end

  def activate_shopify_api(shop_name, token)
    api_session = ShopifyAPI::Session.new(shop_name, token)
    ShopifyAPI::Base.activate_session(api_session)
  end
end
