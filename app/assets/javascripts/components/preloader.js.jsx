var App = window.App || {};

App.Preloader = React.createClass({
  render: function() {
    var sm2TimedOut = this.props.sm2TimedOut;

    return (
      <div className="preloader">
        <div className="preloader__body">
          <i className="preloader__spinner"></i>
          <span className="preloader__text">Loading&hellip;</span>

          {sm2TimedOut &&
            <div className="preloader__notification">
              <i className="icon icon-notify"></i>
              <h3 className="preloader__notification__title">
                No Flash found
              </h3>
              <p className="preloader__notification__subtitle">
                Are you using a Flash blocker? Can't find Adobe Flash. <a href="http://get.adobe.com/flashplayer/">Get Flash</a> or allow Flash.
              </p>
            </div>
          }
        </div>
      </div>
    );
  }
});
