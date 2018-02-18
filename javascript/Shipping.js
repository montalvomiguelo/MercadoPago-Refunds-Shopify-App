import React from 'react';

import PropTypes from 'prop-types';

import InputGroup from './InputGroup';

function Shipping(props) {
  return (
    <div className="footer-shipping">
      <span>Shipping ($ {props.maximumRefundable} remaining)</span>
      <InputGroup
        append="$"
        value={props.shipping}
        onChange={props.onChangeShipping}
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
