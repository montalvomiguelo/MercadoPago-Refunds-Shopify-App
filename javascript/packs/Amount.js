import React from 'react';

function Amount(props) {
  return (
    <div className="footer-subtotal">
      <span>{props.title}</span>
      <em>$ {props.price}</em>
    </div>
  );
}

export default Amount;
