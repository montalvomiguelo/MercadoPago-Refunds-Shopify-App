class ShopifyAPI::Order
  def discount_code
    @discount_code ||= discount_codes.first
  end

  def discount_rate
    total_discounts.to_f / total_line_items_price.to_f
  end

  def refunds_for_line_item(line_item)
    refunds_with_line_item = refunds_with_line_item(line_item)
    refund_line_items = refund_line_items(line_item, refunds_with_line_item)
    sum_refund_line_items(refund_line_items)
  end

  private

    def refunds_with_line_item(line_item)
      refunds.select do |refund|
        refund.refund_line_items.any? { |refund_item| refund_item.line_item.id == line_item.id }
      end
    end

    def refund_line_items(line_item, refunds_with_line_item)
      refunds_with_line_item.map { |refund| find_refund_for_item(line_item, refund.refund_line_items) }
    end

    def find_refund_for_item(line_item, refund_line_items)
      refund_line_items.detect { |refund_item| refund_item.line_item.id == line_item.id }
    end

    def sum_refund_line_items(refund_line_items)
      refund_line_items.inject(0) { |sum, refund_item| sum + refund_item.quantity }
    end

end
