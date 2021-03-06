module ShopifyHelper
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
    return_to = request.path_info

    if !session.key?(:shopify)
      authenticate(return_to)
    elsif params[:shop].present? && session[:shopify][:shop] != sanitize_shop_param(params)
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

  private

    def activate_shopify_api(shop_name, token)
      api_session = ShopifyAPI::Session.new(shop_name, token)
      ShopifyAPI::Base.activate_session(api_session)
    end

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
      return unless params[:shop].present?

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
