import React from 'react';

import { AppProvider } from '@shopify/polaris';

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
    <AppProvider shopOrigin={shopOrigin} apiKey={apiKey}>
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/order" component={Refund} />
          <Route path="/preferences" component={Preferences} />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
