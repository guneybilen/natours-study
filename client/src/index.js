import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './index.css';
import Login from './Login';
import * as serviceWorker from './serviceWorker';
import Signup from './Signup';
import App from './App';
import ReactNotification from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
// import withAuth from './withAuth'

import $ from 'jquery';

$(window).on('beforeunload', function() {
  fetch('/api/v1/users/logout');
});

ReactDOM.render(
  <React.StrictMode>
    <ReactNotification />
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/app" component={App} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
