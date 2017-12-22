class ShopifyAPI::Order
  def discount_code
    @discount_code ||= discount_codes.first
  end

  def discount_rate
    total_discounts.to_f / total_line_items_price.to_f
  end

  def discount_amount
    discount_code.amount
  end

end
