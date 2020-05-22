import React from 'react';
import { withRouter, Link } from 'react-router-dom';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '', email: '',  password: '', passwordConfirm: '' };

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
    fetch('/api/v1/users/signup', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 201) {
          this.props.history.push('/app');
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch(err => {
        console.error(err);
        alert('Error logging in please try again');
      });
  };

  render() {
    return (
      <>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Signup</legend>
            <br />
            <label>
              Name:
              <input
                type="text"
                name="name"
                placeholder="Enter email"
                value={this.state.name}
                onChange={this.handleInputChange}
                required
              />
            </label>
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
            <label>
              Password:
              <input
                type="password"
                name="passwordConfirm"
                placeholder="Enter password again"
                value={this.state.passwordConfirm}
                onChange={this.handleInputChange}
                required
              />
            </label>
            <input type="submit" value="Submit" />
            <Link to="/" className="lnk"> | Login</Link>
          </fieldset>
        </form>
      </>
    );
  }
}

export default withRouter(Signup);
