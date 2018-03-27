class ShopifyAPI::Order

  def tags_include?(tag)
    tags_list.include?(tag)
  end

  def tags_list
    @tags_list ||= tags.split(', ')
  end

  def tags_remove(tag)
    @tags_list = tags_list - [tag]
  end

  def tags_string
    tags_list.join(', ')
  end

  def refunded?
    Money.new(total_refund) == total_price.to_money
  end

  def persist_refund_amount(amount)
    metafield = find_metafield_by_namespace('mercadopago')

    return update_metafield_value(metafield, amount) if metafield

    value = amount.to_money

    add_metafield(ShopifyAPI::Metafield.new(namespace: 'mercadopago', key: 'refund_amount', value: value.cents, value_type: 'string'))
  end

  def total_refund
    metafield = find_metafield_by_namespace('mercadopago')
    return Money.new(metafield.value) if metafield
    Money.new(0)
  end

  def payment_status
    total_price = Monetize.parse(self.total_price)
    total_refund = self.total_refund

    return 'Partially Refunded'  if total_refund > Monetize.parse('0') && total_refund < total_price
    return 'Refunded' if total_refund == total_price
    return financial_status.split('_').map(&:capitalize).join(' ');
  end

  private

    def update_metafield_value(metafield, value)
      amount = Money.new(metafield.value)
      amount += value.to_money
      metafield.value = amount.cents
      metafield.save
    end

    def find_metafield_by_namespace(namespace)
      metafields.detect { |metafield| metafield.namespace == namespace }
    end
end
