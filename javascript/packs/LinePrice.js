import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@shopify/polaris'

function LinePrice(props) {
  if (props.fetchingLine === props.line.line_item_id) {
    return <Spinner size="small" color="teal" />;
  }

  return `$ ${props.line.linePrice}`;
}

LinePrice.propTypes = {
  line: PropTypes.object.isRequired,
  fetchingLine: PropTypes.number.isRequired,
};

export default LinePrice;
