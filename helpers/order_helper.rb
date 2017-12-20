module OrderHelper
  def sum_tax_lines(tax_lines)
    tax_lines.inject(0) { |sum, tax_line| sum + tax_line.price.to_f }
  end
end
