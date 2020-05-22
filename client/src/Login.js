import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { store } from 'react-notifications-component';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '' };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  };

  onSubmit = event => {
    event.preventDefault();
    fetch('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 409) {
          document.getElementById('btn').disabled = true;
          store.addNotification({
            title: 'Error',
            message: 'Someone Already Logged in with Those Credentials.',
            type: 'info',
            insert: 'top',
            container: 'top-right',
            animationIn: ['animated', 'fadeIn'],
            animationOut: ['animated', 'fadeOut'],
            dismiss: {
              duration: 15000,
              onScreen: true
            },
            onRemoval: (id, removedBy) => {
              window.location.reload();
            }
          });
          // alert('Already Someone Logged in with Those Credentials.');
          return;
        }
        if (res.status === 200) {
          this.props.history.push('/app');
        } else {
          const error = new Error(res.err);
          throw error;
        }
      })
      .catch(err => {
        console.log(err);
        alert('Error logging in please try again');
      });
  };

  render() {
    return (
      <>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Login</legend>
            <br />
            <label>
              Email:
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={this.state.email}
                onChange={this.handleInputChange}
                required
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={this.state.password}
                onChange={this.handleInputChange}
                required
              />
            </label>
            <input type="submit" value="Submit" id="btn" />
            <Link to="/signup" className="lnk">
              | Signup
            </Link>
          </fieldset>
        </form>
      </>
    );
  }
}

export default withRouter(Login);
