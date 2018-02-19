import React, { Component } from 'react';

import { Page } from '@shopify/polaris';

import { EmbeddedApp } from '@shopify/polaris/embedded';

import Order from './Order';

import axios from 'axios';
import _ from 'lodash';

import numeral from 'numeral';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderName: '',
      lineItems: [],
      subtotal: 0,
      shipping: '0',
      discount: 0,
      totalAvailableToRefund: 0,
      refundAmount: '0',
      name: '',
      address: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      totalPrice: '0',
      currency: '',
      maximumRefundable: '0.00',
      financialStatus: '',
      taxesIncluded: false,
      tax: 0,
      restock: true,
      note: '',
      notify: true
    };
  }

  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  filterShippingRefunds(refunds) {
    const shippingRefunds = _.filter(refunds, refund => {
      return _.some(refund.order_adjustments, {kind: 'shipping_refund'});
    });

    return shippingRefunds;
  }

  shippingAdjustments(shippingRefunds) {
    const shippingAdjustments = _.map(shippingRefunds, refund => {
      return _.find(refund.order_adjustments, {kind: 'refund_discrepancy'});
    });

    return shippingAdjustments;
  }

  totalShippingLines(shippingLines) {
    return _.reduce(shippingLines, (sum, line) => {
      return numeral(sum).add(line.price).value();
    }, 0);
  }

  totalShippingAdjustments(shippingAdjustments) {
    return _.reduce(shippingAdjustments, (sum, adjustment) => {
      return numeral(sum).add(adjustment.amount).value();
    }, 0);
  }

  remainingShippingInOrderInOrder(order) {
    const shippingRefunds = this.filterShippingRefunds(order.refunds);
    const shippingAdjustments = this.shippingAdjustments(shippingRefunds);
    const totalShippingLines = this.totalShippingLines(order.shipping_lines);
    const totalShippingAdjustments = this.totalShippingAdjustments(shippingAdjustments);

    const difference = numeral(totalShippingLines).subtract(totalShippingAdjustments).value();

    return (difference > 0) ? difference : 0;
  }

  availableToRefundInOrder(order) {
    const totalPrice = numeral(order.total_price);
    return totalPrice.subtract(order.total_refund).value();
  }

  orderLineItems(order) {
    return _.map(order.line_items, (item) => {
      return {
        line_item_id: item.id,
        quantity: 0,
        title: item.title,
        variant_title: item.variant_title,
        price: item.price,
        linePrice: '0.00'
      };
    });
  }

  componentDidMount() {
    const orderId = this.getUrlParameter('id');

    axios.get(`/orders/${orderId}`)
      .then(response => {
        const data = response.data;

        console.dir(data);

        const totalAvailableToRefund = this.availableToRefundInOrder(data);

        const name = data.billing_address.name;

        const address = data.billing_address.address1;

        const city = data.billing_address.city;

        const province = data.billing_address.province;

        const zip = data.billing_address.zip;

        const country = data.billing_address.country;

        const totalPrice = data.total_price;

        const currency = data.currency;

        const financialStatus = data.financial_status;

        const lineItems = this.orderLineItems(data);

        this.setState({
          lineItems: lineItems,
          orderName: data.name,
          totalAvailableToRefund: totalAvailableToRefund,
          name: name,
          address: address,
          city: city,
          province: province,
          zip: zip,
          country: country,
          totalPrice: totalPrice,
          currency: currency,
          financialStatus: financialStatus,
          taxesIncluded: data.taxes_included
        });

        return axios.post(`/orders/${orderId}/refunds/calculate`, {
          refund: {
            shipping: {
              amount: this.state.shipping
            }
          }
        });
      })
      .then(response => {
        const data = response.data;

        console.dir(data);

        this.setState({
          maximumRefundable: data.shipping.maximum_refundable
        });
      });
  }

  calculateTaxLines(refund) {
    const tax = _.reduce(refund.refund_line_items, (sum, line) => {
      return numeral(sum).add(line.total_tax);
    }, 0);

    return numeral(tax).value();
  }

  calculateRefundDiscount(refund) {
    const discount = _.reduce(refund.refund_line_items, (sum, line) => {
      return numeral(sum).add(line.total_cart_discount_amount);
    }, 0);

    return numeral(discount).value();
  }

  calculateRefundSubtotal(refund) {
    const subtotal = _.reduce(refund.refund_line_items, (sum, line) => {
      return numeral(sum).add(line.price);
    }, 0);

    return numeral(subtotal).value();
  }

  handleInputChange(field) {
    return (value) => this.setState({[field]: value});
  }

  onChangeShipping(value, id) {
    this.state.shipping = value;
    this.setState(this.state);

    const orderId = this.getUrlParameter('id');

    axios.post(`/orders/${orderId}/refunds/calculate`, {
      refund: {
        refund_line_items: this.state.lineItems,
        shipping: {
          amount: this.state.shipping
        }
      }
    })
    .then(response => {
      const data = response.data;

      const taxLines = this.calculateTaxLines(data);
      const shippingTax = response.data.shipping.tax;

      const tax = numeral(taxLines).add(shippingTax);

      this.state.tax = tax.value();
      this.state.refundAmount = this.calculateRefundAmount().toString();
      this.setState(this.state);
    });
  }

  calculateRefundAmount() {
    const sum = numeral(0);

    sum.add(this.state.subtotal);
    sum.add(this.state.shipping);

    sum.subtract(this.state.discount);

    if (!this.state.taxesIncluded) {
      sum.add(this.state.tax);
    }

    return sum.value();
  }

  onChangeQty(value, id) {
    const lineItem = _.find(this.state.lineItems, {line_item_id: id});
    lineItem.quantity = value;
    this.setState(this.state);

    const orderId = this.getUrlParameter('id');

    axios.post(`/orders/${orderId}/refunds/calculate`, {
      refund: {
        refund_line_items: this.state.lineItems,
        shipping: {
          amount: this.state.shipping
        }
      }
    })
    .then((response => {
      const data = response.data;
      const item = _.find(data.refund_line_items, {line_item_id: id});

      lineItem.linePrice = (item) ? item.subtotal : '0.00';

      const taxLines = this.calculateTaxLines(data);
      const shippingTax = response.data.shipping.tax;

      const tax = numeral(taxLines).add(shippingTax);

      const subtotal = this.calculateRefundSubtotal(data);
      const discount = this.calculateRefundDiscount(data);

      this.state.subtotal = subtotal;
      this.state.discount = discount;
      this.state.tax = tax.value();
      this.state.refundAmount = this.calculateRefundAmount().toString();
      this.setState(this.state);
    }));
  }

  render() {
    const { apiKey, shopOrigin } = window;

    return (
      <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
        <Page
          title={`Order ${this.state.orderName}`}
          primaryAction={{
            content: 'Refund $ 0.00',
            disabled: true,
          }}
          secondaryActions={[
            {content: 'View order'},
          ]}
        >
          <Order
            lineItems={this.state.lineItems}
            subtotal={this.state.subtotal}
            shipping={this.state.shipping}
            discount={this.state.discount}
            totalAvailableToRefund={this.state.totalAvailableToRefund}
            refundAmount={this.state.refundAmount}
            name={this.state.name}
            address={this.state.address}
            city={this.state.city}
            province={this.state.province}
            zip={this.state.zip}
            country={this.state.country}
            totalPrice={this.state.totalPrice}
            currency={this.state.currency}
            maximumRefundable={this.state.maximumRefundable}
            financialStatus={this.state.financialStatus}
            onChangeQty={this.onChangeQty.bind(this)}
            tax={this.state.tax}
            onChangeShipping={this.onChangeShipping.bind(this)}
            onChangeAmount={this.handleInputChange('refundAmount')}
            onChangeRestock={this.handleInputChange('restock')}
            restock={this.state.restock}
            note={this.state.note}
            onChangeNote={this.handleInputChange('note')}
            notify={this.state.notify}
            onChangeNotify={this.handleInputChange('notify')}
          />
        </Page>
      </EmbeddedApp>
    );
  }
}

export default App;
