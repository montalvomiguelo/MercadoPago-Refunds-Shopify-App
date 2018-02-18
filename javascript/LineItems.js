import React from 'react';

import { TextField } from '@shopify/polaris';

import PropTypes from 'prop-types';

function LineItems(props) {
  return (
    <ul className="line-items">
      {props.items.map(item => (
        <li key={item.line_item_id} className="line-item">
          <p className="line-item-title">
            {item.title}
            <em>{item.variant_title}</em>
          </p>
          <p className="line-item-price">$ {item.price}</p>
          <span className="line-item-times">&times;</span>
          <div className="line-item-qty">
            <TextField
              type="number"
              value={item.quantity}
              onChange={(value) => props.onChangeQty(value, item.line_item_id)}
              min={0}
            />
          </div>
          <span className="line-item-line-price">$ {item.linePrice}</span>
        </li>
      ))}
    </ul>
  );
}

LineItems.propTypes = {
  items: PropTypes.array.isRequired,
  onChangeQty: PropTypes.func.isRequired
};

export default LineItems;