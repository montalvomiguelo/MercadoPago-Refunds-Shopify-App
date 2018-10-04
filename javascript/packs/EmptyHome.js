import React from 'react';

import { EmptyState } from '@shopify/polaris';

function EmptyHome(props) {
  return (
    <EmptyState
      heading="There are no orders to refund"
      action={{content: 'Preferences', url: '/preferences'}}
      secondaryAction={{content: 'Learn more', url: 'https://help.shopify.com/en/api/reference/orders/order', external: true}}
      image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
    >
      <p>Only the last 60 day's worth of orders from a store will be shown here.</p>
    </EmptyState>
  );
}

export default EmptyHome;
