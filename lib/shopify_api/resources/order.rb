class ShopifyAPI::Order

  def refunds_for_line_item(line_item)
    refunds_with_line_item = refunds_with_line_item(line_item)
    refund_line_items = refund_line_items(line_item, refunds_with_line_item)
    sum_refund_line_items(refund_line_items)
  end

  def persist_refund_amount(amount)
    metafield = find_metafield_by_namespace('mercadopago')

    return update_metafield_value(metafield, amount) if metafield

    add_metafield(ShopifyAPI::Metafield.new(namespace: 'mercadopago', key: 'refund_amount', value: amount, value_type: 'string'))
  end

  def total_refund
    metafield = find_metafield_by_namespace('mercadopago')
    return metafield.value if metafield
    0
  end

  private

    def update_metafield_value(metafield, value)
      amount = metafield.value.to_f
      amount += BigDecimal(value.to_s)
      metafield.value = amount.to_s('F')
      metafield.save
    end

    def find_metafield_by_namespace(namespace)
      metafields.detect { |metafield| metafield.namespace == namespace }
    end

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
