import React from 'react';

import PropTypes from 'prop-types';

import InputGroup from './InputGroup';

function FooterAmount(props) {
  return (
    <div className="footer-amount">
      <span>Refund amount</span>
      <InputGroup
        append="$"
        value={props.amount}
        onChange={props.onChangeAmount}
      />
    </div>
  );
}

FooterAmount.propTypes = {
  amount: PropTypes.number.isRequired,
  onChangeAmount: PropTypes.func.isRequired
};

export default FooterAmount;
