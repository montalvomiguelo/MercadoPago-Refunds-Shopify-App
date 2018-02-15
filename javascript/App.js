import React, { Component } from 'react';

import { Page } from '@shopify/polaris';

import { EmbeddedApp } from '@shopify/polaris/embedded';

import Order from './Order';

import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';

import numeral from 'numeral';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderName: '',
      lineItems: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      totalAvailableToRefund: 0,
      refundAmount: 0,
      name: '',
      address: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      totalPrice: '0',
      currency: '',
      maximumRefundable: '0',
      financialStatus: ''
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
    return totalPrice.subtract(order.total_refund.fractional).value();
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

        this.setState({
          lineItems: data.line_items,
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
          financialStatus: financialStatus
        });

        return axios.post(`/orders/${orderId}/refunds/calculate`, qs.stringify({
          refund: {
            refund_line_items: [],
            shipping: {
              amount: 0
            }
          }
        }));
      })
      .then(response => {
        const data = response.data;

        console.dir(data);

        this.setState({
          maximumRefundable: data.shipping.maximum_refundable
        });
      });
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
          />
        </Page>
      </EmbeddedApp>
    );
  }
}

export default App;
