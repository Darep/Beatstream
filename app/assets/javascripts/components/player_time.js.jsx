/** @jsx React.DOM */

var App = window.App || {};

App.PlayerTime = React.createClass({
  render: function() {
    var duration = this.formattedTime(this.props.duration || 0);
    var elapsed = this.formattedTime(this.props.elapsed || 0);

    return (
      <div>
        <span className="elapsed">{elapsed}</span>
        <span className="separator"> / </span>
        <span className="duration">{duration}</span>
      </div>
    );
  },

  formattedTime: function (milliseconds) {
    var mins = Math.floor(milliseconds/60, 10),
        secs = milliseconds - mins*60;

    return (mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs);
  }
});
