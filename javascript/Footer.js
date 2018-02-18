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
      />
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
  shipping: PropTypes.string.isRequired,
  discount: PropTypes.number.isRequired,
  totalAvailableToRefund: PropTypes.number.isRequired,
  refundAmount: PropTypes.number.isRequired,
  maximumRefundable: PropTypes.string.isRequired,
  tax: PropTypes.number.isRequired,
  onChangeShipping: PropTypes.func.isRequired,
  onChangeAmount: PropTypes.func.isRequired
};

export default Footer;