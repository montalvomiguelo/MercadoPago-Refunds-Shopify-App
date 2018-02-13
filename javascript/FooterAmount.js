import React from 'react';

import PropTypes from 'prop-types';

import InputGroup from './InputGroup';

function FooterAmount(props) {
  return (
    <div className="footer-amount">
      <span>Refund amount</span>
      <InputGroup append="$" value={props.amount} />
    </div>
  );
}

FooterAmount.propTypes = {
  amount: PropTypes.number.isRequired
};

export default FooterAmount;
