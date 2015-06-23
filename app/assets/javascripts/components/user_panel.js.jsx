//= require ./settings_modal
/** @jsx React.DOM */

var App = window.App || {};

App.UserPanel = React.createClass({
  getInitialState: function () {
    return { open: false };
  },

  componentDidMount: function () {
    document.addEventListener("click", this.pageClick, false);
  },

  componentWillUnmount: function() {
    document.removeEventListener("click", this.pageClick);
  },

  render: function() {
    var user = this.props.user;
    var linkClassName = 'user-menu__toggle';
    var menuClassName = '';

    if (this.state.open) {
      linkClassName += ' act';
      menuClassName = 'open';
    }

    return (
      <div id="user-panel">
        <a href="#" onClick={this.toggleMenu} className={linkClassName}>
           <span className="name">{user.username}</span>
           <span className="dropdown"></span>
        </a>
        <ul id="user-menu" className={menuClassName}>
          <li><a href="#" onClick={this.openSettings}>Settings</a></li>
          <li><a href="/logout">Log out</a></li>
        </ul>
      </div>
    );
  },

  openSettings: function (event) {
    var settingsModal = document.getElementById('settings-modal');

    if (settingsModal) {
      var modal = document.getElementById('modal');

      if (modal.className.indexOf('show') <= -1) {
        modal.className += ' show';
      }
    } else {
      React.render(
        <App.SettingsModal user={this.props.user} />,
        document.getElementById('modal')
      );
    }
  },

  toggleMenu: function (event) {
    this.setState({ open: !this.state.open });
  },

  pageClick: function (e) {
    var match = false;

    if (!this.state.open) {
      // Not open, do nothing
      return;
    }

    for (var element = e.target; element; element = element.parentNode) {
      if (element.className && element.className.indexOf('user-menu__toggle') >= 0) {
        match = true;
        return;
      }
    }

    if (!match) {
      this.setState({ open: false });
    }
  }
});
