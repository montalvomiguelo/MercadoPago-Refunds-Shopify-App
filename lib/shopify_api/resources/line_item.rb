class ShopifyAPI::LineItem
  def taxes_sum
    tax_lines.inject(0) { |sum, tax_line| sum + tax_line.price.to_f }
  end

  def taxes_per_unit
    (taxes_sum / quantity).round(2)
  end

  def discount?
    find_discounted_tax_line
  end

  private

    def find_discounted_tax_line
      tax_lines.detect do |tax_line|
        tax_line_price(tax_line) > tax_line.price.to_f / quantity
      end
    end

    def tax_line_price(tax_line)
      (price.to_f * tax_line.rate).round(2)
    end

end
