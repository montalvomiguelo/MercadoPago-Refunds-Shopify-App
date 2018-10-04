import React, { Component } from 'react';
import moment from 'moment';

import {
  Page,
  Layout,
  Card,
  Banner,
  Link,
  DataTable,
  Badge
} from '@shopify/polaris';

import axios from 'axios';

import SkeletonHome from './SkeletonHome';
import EmptyHome from './EmptyHome';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: null
    };
  }

  componentDidMount() {
    axios.get(`/orders`)
      .then(response => {
        const data = response.data;

        const orders = data.map(order => [
          <Link url={`/order?id=${order.id}`}>{order.name}</Link>,
          moment(order.created_at).format('MMM DD, hh:mma'),
          order.billing_address.name,
          <Badge>{order.financial_status}</Badge>,
          <Badge>{order.fulfillment_status || 'unfulfilled'}</Badge>,
          `$ ${order.total_price}`
        ]);

        this.setState({orders});
      });
  }

  render() {
    if (!this.state.orders) {
      return <SkeletonHome />;
    }

    if (this.state.orders && this.state.orders.length === 0) {
      return <EmptyHome />;
    }

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
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text'
                ]}
                headings={[
                  'Order',
                  'Date',
                  'Placed by',
                  'Financial status',
                  'Fulfillment status',
                  'Total'
                ]}
                rows={this.state.orders}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Home;
