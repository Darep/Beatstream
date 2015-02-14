/** @jsx React.DOM */

var App = window.App || {};

App.UserPanel = React.createClass({
  getInitialState: function () {
    return { open: false };
  },

  toggleMenu: function (event) {
    this.setState({ open: !this.state.open });
  },

  render: function() {
    var user = this.props.user;
    var linkClassName = '';
    var menuClassName = '';

    if (this.state.open) {
      linkClassName = 'act';
      menuClassName = 'open';
    }

    return (
      <div id="user-panel">
        <a href="#" onClick={this.toggleMenu} className={linkClassName}>
           <span className="name">{user.name}</span>
           <span className="dropdown"></span>
        </a>
        <ul id="user-menu" className={menuClassName}>
          <li><a href="#!/settings" onClick={this.toggleMenu}>Settings</a></li>
          <li><a href="/logout" onClick={this.toggleMenu}>Log out</a></li>
        </ul>
      </div>
    );
  }
});
