//= require ./user_panel
/** @jsx React.DOM */

var App = window.App || {};

App.Header = React.createClass({
  render: function() {
    var user = this.props.user || {};
    return (
      <header id="header">
        <h1 id="logo">
          <a href="/">Beatstream</a>
          <small>alpha</small>
        </h1>
        <App.UserPanel user={user}/>
      </header>
    );
  }
});
