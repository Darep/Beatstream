//= require lib/utils
/** @jsx React.DOM */

var App = window.App || {};

App.PlaylistHeader = React.createClass({
  getInitialState: function() {
    return {
      search: ""
    };
  },

  render: function () {
    var count = this.props.count;
    count = typeof count !== 'undefined' ? this.formattedCount(count) : '-';

    return (
      <div className="page-header">
        <div className="info">
          <h2>All music</h2>
          <p className="meta">
            <span className="count">{count}</span>
            <span className="separator"> </span>
            <span className="text">{this.props.count === 1 ? 'song' : 'songs' }</span>
          </p>
        </div>
        <div className="search">
            <input ref="searchInput" id="search" type="text" placeholder="Find songs" value={this.state.search} onChange={this.handleSearchChange} onKeyUp={this.handleSearchKeyUp} />
            <a href="#" className="clear" onClick={this.clearSearch}>clear</a>
        </div>
      </div>
    );
  },

  handleSearchKeyUp: function (e) {
    if (e.which === 27) {
      // clear on esc
      this.clearSearch();
    }
  },

  handleSearchChange: function (e) {
    var value = this.refs.searchInput.getDOMNode().value;
    this.setState({ search: value });
    this.props.filter(value);
  },

  clearSearch: function () {
    this.setState({ search: '' });
    this.props.filter('');
  },

  formattedCount: function (count) {
    return commify( parseInt(count, 10) );
  }
});
