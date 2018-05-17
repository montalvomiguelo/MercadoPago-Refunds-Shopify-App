import React, { Component } from 'react';

import {
  Page,
  Layout,
  Card,
  Banner,
  Link
} from '@shopify/polaris';

import axios from 'axios';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: []
    };
  }

  componentDidMount() {
    axios.get(`/orders`)
      .then(response => {
        const data = response.data;
        this.setState({
          orders: data
        });
      });
  }

  formatDate(date_string) {
    const date = new Date(date_string);
    return date.toLocaleString();
  }

  render() {
    return (
      <Page
        secondaryActions={[
          {content: 'Preferences', url: 'preferences'},
        ]}
      >
        <Layout>
          <Layout.Section>
            <Banner
              status="info"
            >
              <p>To refund an order, either select an order from your <Link url={`${window.shopOrigin}/admin/orders`} external={true}>Orders</Link> page or click on one of the recent orders below.</p>
            </Banner>
          </Layout.Section>
          <Layout.Section>
            <Card sectioned>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Placed by</th>
                    <th>Financial status</th>
                    <th>Fulfillment status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                    {this.state.orders.map(order => (
                      <tr key={order.id}>
                        <td><a href={`/order?id=${order.id}`}>{order.name}</a></td>
                        <td>{this.formatDate(order.created_at)}</td>
                        <td>{order.billing_address.name}</td>
                        <td>{order.financial_status}</td>
                        <td>{order.fulfillment_status ? order.fulfillment_status : 'unfulfilled'}</td>
                        <td>$ {order.total_price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Home;