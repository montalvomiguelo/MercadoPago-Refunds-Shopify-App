module OrderHelper
  def find_order!
    begin
      @order = ShopifyAPI::Order.find(params[:id])
    rescue ActiveResource::ResourceNotFound => e
      halt 404, "Order #{params[:id]} not found"
    end
  end
end
