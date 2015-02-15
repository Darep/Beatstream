//= require lib/utils
/** @jsx React.DOM */

var App = window.App || {};

App.PlaylistHeader = React.createClass({
  render: function () {
    var count = this.props.count;
    count = typeof count !== 'undefined' ? this.formattedCount(count) : '-';

    return (
      <div>
        <h2>All music</h2>
        <p className="meta">
          <span className="count">{count}</span>
          <span className="separator"> </span>
          <span className="text">{this.props.count === 1 ? 'song' : 'songs' }</span>
        </p>
      </div>
    );
  },

  formattedCount: function (count) {
    return commify( parseInt(count, 10) );
  }
});
