import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@shopify/polaris';

function Amount(props) {
  const Price = props.fetchingLine && props.fetchingLine !== 0 ? (
    <em><Spinner color="teal" size="small" /></em>
  ) : (
    <em>$ {props.price}</em>
  );

  return (
    <div className="footer-subtotal">
      <span>{props.title}</span>
      {Price}
    </div>
  );
}

Amount.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  fetchingLine: PropTypes.number,
};

export default Amount;
