import React from 'react';

import PropTypes from 'prop-types';

import InputGroup from './InputGroup';

function Shipping(props) {
  return (
    <div className="footer-shipping">
      <span>Shipping ($ {props.remainingShipping} remaining)</span>
      <InputGroup append="$" value={props.cost} />
    </div>
  );
}

Shipping.propTypes = {
  cost: PropTypes.number.isRequired,
  remainingShipping: PropTypes.number.isRequired
};

export default Shipping;
