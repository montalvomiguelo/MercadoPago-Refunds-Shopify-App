class ShopifyAPI::LineItem
  def taxes_sum
    tax_lines.inject(0) { |sum, tax_line| sum + tax_line.price.to_f }
  end

  def taxes_per_unit
    (taxes_sum / quantity).round(2)
  end

  def has_discount_with_order?(order)
    order_includes_taxes?(order)
    find_discounted_tax_line
  end

  private

    def order_includes_taxes?(order)
      @taxes_included ||= order.taxes_included
    end

    def find_discounted_tax_line
      tax_lines.detect do |tax_line|
        tax_line_price(tax_line) > tax_line.price.to_f / quantity
      end
    end

    def tax_line_price(tax_line)
      unless @taxes_included
        return (price.to_f * tax_line.rate).round(2)
      end
      (tax_line.rate * price.to_f / (1 + tax_line.rate)).round(2)
    end

end
