import React from 'react';
import { Page, EmptyState } from '@shopify/polaris';

function NotFound(props) {
  return (
    <Page>
      <EmptyState
        heading="The page you're looking for couldn't be found"
        action={{content: 'Back to index', url: '/'}}
      >
        <p>Check the web address and try again.</p>
      </EmptyState>
    </Page>
  );
}

export default NotFound;
