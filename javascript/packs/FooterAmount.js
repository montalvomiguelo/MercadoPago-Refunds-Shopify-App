import React from 'react';

import PropTypes from 'prop-types';

import { TextField } from '@shopify/polaris';

function FooterAmount(props) {
  return (
    <div className="footer-amount">
      <span>Refund amount</span>
      <TextField
        prefix="$"
        value={props.amount}
        onChange={props.onChangeAmount}
      />
    </div>
  );
}

FooterAmount.propTypes = {
  amount: PropTypes.string.isRequired,
  onChangeAmount: PropTypes.func.isRequired
};

export default FooterAmount;
