import React from 'react';

import PropTypes from 'prop-types';

import {
  Layout,
  Card,
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
          <LineItems
            items={props.lineItems}
            onChangeQty={props.onChangeQty}
            fetchingLine={props.fetchingLine}
          />
          <Footer
            subtotal={props.subtotal}
            shipping={props.shipping}
            discount={props.discount}
            totalAvailableToRefund={props.totalAvailableToRefund}
            refundAmount={props.refundAmount}
            maximumRefundable={props.maximumRefundable}
            tax={props.tax}
            onChangeShipping={props.onChangeShipping}
            onChangeAmount={props.onChangeAmount}
            onChangeRestock={props.onChangeRestock}
            restock={props.restock}
            note={props.note}
            onChangeNote={props.onChangeNote}
            notify={props.notify}
            onChangeNotify={props.onChangeNotify}
            fetchingLine={props.fetchingLine}
            fetchingShipping={props.fetchingShipping}
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
          totalRefund={props.totalRefund}
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
  refundAmount: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  province: PropTypes.string.isRequired,
  zip: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  totalPrice: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  maximumRefundable: PropTypes.string.isRequired,
  financialStatus: PropTypes.string.isRequired,
  onChangeQty: PropTypes.func.isRequired,
  tax: PropTypes.number.isRequired,
  onChangeShipping: PropTypes.func.isRequired,
  onChangeAmount: PropTypes.func.isRequired,
  shipping: PropTypes.string.isRequired,
  onChangeRestock: PropTypes.func.isRequired,
  restock: PropTypes.bool.isRequired,
  note: PropTypes.string.isRequired,
  onChangeNote: PropTypes.func.isRequired,
  notify: PropTypes.bool.isRequired,
  onChangeNotify: PropTypes.func.isRequired,
  totalRefund: PropTypes.string.isRequired,
  fetchingLine: PropTypes.number.isRequired,
  fetchingShipping: PropTypes.bool.isRequired,
};

export default Order;
