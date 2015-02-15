/** @jsx React.DOM */

var App = window.App || {};

App.Sidebar = React.createClass({
  render: function() {
    var count = this.props.count;
    count = typeof count !== 'undefined' ? this.formattedCount(count) : '-';

    return (
      <div id="sidebar-wrap">
        <ul className="common">
          <li className="all-music act">
            <a href="#">All music <span className="count">{count}</span></a>
          </li>
        </ul>
        <p className="none">
          Playlists haven't been implemented yet! Stay tuned.
        </p>
      </div>
    );
  },

  formattedCount: function (count) {
    return commify( parseInt(count, 10) );
  }
});
