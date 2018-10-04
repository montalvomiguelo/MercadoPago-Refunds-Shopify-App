import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader';

import Refund from './Refund';
import Home from './Home';
import Preferences from './Preferences';

import {
  BrowserRouter,
  Route,
  withRouter
} from 'react-router-dom';

import RoutePropagator from '@shopify/react-shopify-app-route-propagator';

const Propagator = withRouter(RoutePropagator);

class App extends Component {
  // This line is very important! It tells React to attach the `easdk`
  // object to `this.context` within your component.
  static contextTypes = {
    easdk: PropTypes.object,
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Propagator />
          <Route exact path="/" component={Home} />
          <Route path="/order" render={({ location }) => (
            <Refund search={location.search} />
          )} />
          <Route path="/preferences" component={Preferences} />
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default hot(module)(App);
