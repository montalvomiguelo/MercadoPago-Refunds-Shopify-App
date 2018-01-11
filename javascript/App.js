import React, { Component } from 'react';

import { Page } from '@shopify/polaris';
import { EmbeddedApp } from '@shopify/polaris/embedded';

class App extends Component {
  render() {
    const { apiKey, shopOrigin } = window;

    return (
      <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
        <Page
          breadcrumbs={[{content: 'Products'}]}
          title="Jar With Lock-Lid"
          primaryAction={{
            content: 'Save',
            disabled: true,
          }}
          secondaryActions={[
            {content: 'Duplicate'},
            {content: 'View on your store'},
          ]}
          pagination={{
            hasPrevious: true,
            hasNext: true,
          }}
        >
          <p>Page content</p>
        </Page>
      </EmbeddedApp>
    );
  }
}

export default App;
