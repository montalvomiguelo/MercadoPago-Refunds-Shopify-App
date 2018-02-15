import React from 'react';

import PropTypes from 'prop-types';

import {
  Layout,
  Card,
  Badge
} from '@shopify/polaris';

import LineItems from './LineItems';
import Footer from './Footer';
import Sidebar from './Sidebar';

function Order(props) {
  return (
    <Layout>
      <Layout.Section>
        <Card
          title="Refund payments"
          sectioned
        >
          <LineItems items={props.lineItems} />
          <Footer
            subtotal={props.subtotal}
            shipping={props.shipping}
            discount={props.discount}
            totalAvailableToRefund={props.totalAvailableToRefund}
            refundAmount={props.refundAmount}
            maximumRefundable={props.maximumRefundable}
          />
        </Card>
      </Layout.Section>
      <Layout.Section secondary>
        <Sidebar
          name={props.name}
          address={props.address}
          city={props.city}
          province={props.province}
          zip={props.zip}
          country={props.country}
          currency={props.currency}
          totalPrice={props.totalPrice}
          financialStatus={props.financialStatus}
        />
      </Layout.Section>
    </Layout>
  );
}

Order.propTypes = {
  lineItems: PropTypes.array.isRequired,
  subtotal: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  totalAvailableToRefund: PropTypes.number.isRequired,
  refundAmount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  province: PropTypes.string.isRequired,
  zip: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  totalPrice: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  maximumRefundable: PropTypes.string.isRequired,
  financialStatus: PropTypes.string.isRequired
};

export default Order;

