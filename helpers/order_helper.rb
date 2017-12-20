module OrderHelper
  def sum_tax_lines(tax_lines)
    tax_lines.inject(0) { |sum, tax_line| sum + tax_line.price.to_f }
  end

  def line_item_refunds_in_order(line_item, order)

    refunds = refunds_for_line_item(order.refunds, line_item)

    refund_line_items = refund_line_items(refunds, line_item)

    sum_refund_line_items(refund_line_items)

  end

  private

    def refunds_for_line_item(refunds, line_item)
      refunds.select do |refund|
        refund.refund_line_items.any? { |refund_item| refund_item.line_item.id == line_item.id }
      end
    end

    def refund_line_items(refunds, line_item)
      refunds.map { |refund| find_refund_for_item(line_item, refund.refund_line_items) }
    end

    def find_refund_for_item(line_item, refund_line_items)
      refund_line_items.detect { |refund_item| refund_item.line_item.id == line_item.id }
    end

    def sum_refund_line_items(refund_line_items)
      refund_line_items.inject(0) { |sum, refund_item| sum + refund_item.quantity }
    end

end
