import React from 'react';

import { EmbeddedApp } from '@shopify/polaris/embedded';

import Refund from './Refund';
import Home from './Home';
import Preferences from './Preferences';

import {
  BrowserRouter,
  Route
} from 'react-router-dom';

function App(props) {
  const { apiKey, shopOrigin } = window;

  return (
    <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/order" component={Refund} />
          <Route path="/preferences" component={Preferences} />
        </div>
      </BrowserRouter>
    </EmbeddedApp>
  );
};

export default App;
