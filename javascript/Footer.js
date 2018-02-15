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
      <Shipping cost={props.shipping} maximumRefundable={props.maximumRefundable} />
      <Amount title="Discounts" price={props.discount} />
      <Amount title="Tax" price={0.00} />
      <Amount title="Total available to refund" price={props.totalAvailableToRefund} />
      <FooterAmount amount={props.refundAmount} />
      <Checkbox
        label="Restock"
        checked
        disabled
      />
      <FormLayout>
        <TextField
          type="text"
          label="Reason for refund (optional)"
        />
      </FormLayout>
    </div>
  );
}

Footer.propTypes = {
  subtotal: PropTypes.number.isRequired,
  shipping: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  totalAvailableToRefund: PropTypes.number.isRequired,
  refundAmount: PropTypes.number.isRequired,
  maximumRefundable: PropTypes.string.isRequired
};

export default Footer;
