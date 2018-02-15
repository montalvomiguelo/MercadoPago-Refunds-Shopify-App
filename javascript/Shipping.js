import React from 'react';

import PropTypes from 'prop-types';

import InputGroup from './InputGroup';

function Shipping(props) {
  return (
    <div className="footer-shipping">
      <span>Shipping ($ {props.maximumRefundable} remaining)</span>
      <InputGroup append="$" value={props.cost} />
    </div>
  );
}

Shipping.propTypes = {
  cost: PropTypes.number.isRequired,
  maximumRefundable: PropTypes.string.isRequired
};

export default Shipping;
