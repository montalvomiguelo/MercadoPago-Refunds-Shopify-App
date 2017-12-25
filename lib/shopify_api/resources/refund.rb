class ShopifyAPI::Refund

  def find_refund_line_with_item(line_item)
    refund_line_items.detect { |refund_line| refund_line.line_item.id == line_item.id }
  end

  def contains_line_item?(line_item)
    refund_line_items.any? { |refund_line| refund_line.line_item.id == line_item.id }
  end

end
