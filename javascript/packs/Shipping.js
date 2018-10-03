import React from 'react';

import PropTypes from 'prop-types';

import { TextField } from '@shopify/polaris';

function Shipping(props) {
  return (
    <div className="footer-shipping">
      <span>Shipping ($ {props.maximumRefundable} remaining)</span>
      <TextField
        type="text"
        value={props.shipping}
        onChange={props.onChangeShipping}
        prefix="$"
      />
    </div>
  );
}

Shipping.propTypes = {
  shipping: PropTypes.string.isRequired,
  maximumRefundable: PropTypes.string.isRequired,
  onChangeShipping: PropTypes.func.isRequired
};

export default Shipping;
