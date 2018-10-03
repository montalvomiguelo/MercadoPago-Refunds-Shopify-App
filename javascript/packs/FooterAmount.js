import React from 'react';

import PropTypes from 'prop-types';

import { TextField, Checkbox } from '@shopify/polaris';

import numeral from 'numeral';

function FooterAmount(props) {
  const restock = (numeral(props.subtotal).value()) ? false : true;

  return (
    <div className="footer-amount">
      <span>Refund with: MercadoPago</span>
      <TextField
        prefix="$"
        value={props.amount}
        onChange={props.onChangeAmount}
      />
      <Checkbox
        label="Restock"
        checked={props.restock}
        onChange={props.onChangeRestock}
        disabled={restock}
      />
    </div>
  );
}

FooterAmount.propTypes = {
  amount: PropTypes.string.isRequired,
  onChangeAmount: PropTypes.func.isRequired,
  restock: PropTypes.bool.isRequired,
  onChangeRestock: PropTypes.func.isRequired,
  subtotal: PropTypes.number.isRequired,
};

export default FooterAmount;
