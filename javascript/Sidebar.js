import React from 'react';

import PropTypes from 'prop-types';

import {
  Card,
  Badge
} from '@shopify/polaris';

function BillingShipping(props) {
  return (
    <Card
      title="Billing and shipping address"
    >
      <Card.Section>
        <p>
          {props.name}<br />
          {props.address}<br />
          {props.city} {props.province} {props.zip}<br />
          {props.country}
        </p>
      </Card.Section>
      <Card.Section>
        <p>
          Order total: $ {props.totalPrice} {props.currency}
        </p>
        <br />
        <p>
          Payment status: <Badge>Refunded</Badge>
        </p>
      </Card.Section>
    </Card>
  );
}

BillingShipping.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  province: PropTypes.string.isRequired,
  zip: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  totalPrice: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired
};

export default BillingShipping;
