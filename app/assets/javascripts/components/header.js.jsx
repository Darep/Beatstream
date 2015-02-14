//= require ./user_panel
/** @jsx React.DOM */

var App = window.App || {};

App.Header = React.createClass({
  render: function() {
    var user = this.props.user || {};
    return (
      <div>
        <h1 id="logo"><a href="/">Beatstream</a> <small><small><small>alpha</small></small></small></h1>
        <App.UserPanel user={user}/>
      </div>
    );
  }
});
