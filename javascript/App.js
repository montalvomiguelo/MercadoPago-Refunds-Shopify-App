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
      notify: true,
      totalRefund: '',
      isRefunding: false
    };
  }

  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  availableToRefundInOrder(order) {
    const totalPrice = numeral(order.total_price);
    return totalPrice.subtract(order.total_refund).value();
  }

  mapLineItems(lineItems) {
    return _.map(lineItems, (item) => {
      return {
        line_item_id: item.id,
        quantity: 0,
        title: item.title,
        variant_title: item.variant_title,
        price: item.price,
        linePrice: '0.00',
        lineQty: item.quantity
      };
    });
  }

  orderLineItems(order) {
    let lineItems = this.mapLineItems(order.line_items);
    return lineItems;
  }

  updateRefundLineItems(lineItems, refunds) {
    return _.map(lineItems, (item) => {
      item.refund = this.refundsForItem(refunds, item);
      return item;
    });
  }

  refundsForItem(refunds, item) {
    const refundsWithItem = this.refundsWithItem(refunds, item);
    const refundLinesForItem = this.refundLinesForItem(refundsWithItem, item);

    return _.reduce(refundLinesForItem, (sum, line) => sum + line.quantity, 0);
  }

  refundsWithItem(refunds, item) {
    return _.filter(refunds, (refund) => {
      if(_.find(refund.refund_line_items, {line_item_id: item.line_item_id})) {
        return refund;
      }
    });
  }

  refundLinesForItem(refundsWithItem, item) {
    return _.flatMap(refundsWithItem, (refund) => refund.refund_line_items, {line_item_id: item.line_item_id});
  }

  componentDidMount() {
    const orderId = this.getUrlParameter('id');

    axios.get(`/orders/${orderId}`)
      .then(response => {
        const data = response.data;

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

        this.updateRefundLineItems(lineItems, data.refunds);

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
          taxesIncluded: data.taxes_included,
          totalRefund: data.total_refund
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

  handleInputChange(field) {
    return (value) => this.setState({[field]: value});
  }

  newRefundSubmit() {
    const orderId = this.getUrlParameter('id');

    this.setState({
      isRefunding: true
    });

    axios.post(`/orders/${orderId}/refunds`, {
      refund: {
        restock: this.state.restock,
        notify: this.state.notify,
        note: this.state.note,
        shipping: {
          amount: this.state.shipping
        },
        refund_line_items: this.state.lineItems,
        amount: this.state.refundAmount
      }
    })
    .then(response => {
      ShopifyApp.flashNotice('Refund created successfully');
      return axios.get(`/orders/${orderId}`)
    })
    .then(response => {
      const data = response.data;

      const totalAvailableToRefund = this.availableToRefundInOrder(data);

      const financialStatus = data.financial_status;

      const lineItems = this.orderLineItems(data);

      this.updateRefundLineItems(lineItems, data.refunds);

      this.setState({
        refundAmount: '0',
        subtotal: 0,
        discount: 0,
        shipping: '0',
        tax: 0,
        note: '',
        lineItems: lineItems,
        totalAvailableToRefund: totalAvailableToRefund,
        financialStatus: financialStatus,
        totalRefund: data.total_refund,
        isRefunding: false
      });
    })
    .catch(error => {
      ShopifyApp.flashError(error.response.data);
      this.setState({
        isRefunding: false
      });
    });
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

  isButtonDisabled() {
    const refundAmount = numeral(this.state.refundAmount).value();
    const isRefunding = this.state.isRefunding;

    return (!refundAmount || isRefunding) ? true : false;
  }

  render() {
    const { apiKey, shopOrigin } = window;
    const buttonDisabled = this.isButtonDisabled();

    return (
      <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
        <Page
          title={`Order ${this.state.orderName}`}
          primaryAction={{
            content: `Refund $ ${this.state.refundAmount}`,
            disabled: buttonDisabled,
            onAction: this.newRefundSubmit.bind(this)
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
            totalRefund={this.state.totalRefund}
          />
        </Page>
      </EmbeddedApp>
    );
  }
}

export default App;
