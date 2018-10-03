import React from 'react';

import PropTypes from 'prop-types';

import {
  TextField,
  Checkbox,
  FormLayout
} from '@shopify/polaris';

import Amount from './Amount';
import Shipping from './Shipping';
import FooterAmount from './FooterAmount';

function Footer(props) {
  return (
    <div className="footer">
      <Amount title="Subtotal" price={props.subtotal} />
      <Shipping
        shipping={props.shipping}
        maximumRefundable={props.maximumRefundable}
        onChangeShipping={props.onChangeShipping}
      />
      <Amount title="Discounts" price={props.discount} />
      <Amount title="Tax" price={props.tax} />
      <Amount title="Total available to refund" price={props.totalAvailableToRefund} />
      <FooterAmount
        amount={props.refundAmount}
        onChangeAmount={props.onChangeAmount}
        restock={props.restock}
        onChangeRestock={props.onChangeRestock}
        subtotal={props.subtotal}
      />
      <FormLayout>
        <TextField
          type="text"
          value={props.note}
          label="Reason for refund (optional)"
          onChange={props.onChangeNote}
        />
        <Checkbox
          label="Send a notification to the customer"
          checked={props.notify}
          onChange={props.onChangeNotify}
        />
      </FormLayout>
    </div>
  );
}

Footer.propTypes = {
  subtotal: PropTypes.number.isRequired,
  shipping: PropTypes.string.isRequired,
  discount: PropTypes.number.isRequired,
  totalAvailableToRefund: PropTypes.number.isRequired,
  refundAmount: PropTypes.string.isRequired,
  maximumRefundable: PropTypes.string.isRequired,
  tax: PropTypes.number.isRequired,
  onChangeShipping: PropTypes.func.isRequired,
  onChangeAmount: PropTypes.func.isRequired,
  onChangeRestock: PropTypes.func.isRequired,
  restock: PropTypes.bool.isRequired,
  note: PropTypes.string.isRequired,
  onChangeNote: PropTypes.func.isRequired,
  notify: PropTypes.bool.isRequired,
  onChangeNotify: PropTypes.func.isRequired
};

export default Footer;
