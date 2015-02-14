//= require mediator.min

var App = window.App || {};

(function () {
    var _mediator = new Mediator();
    var subscribers = [];

    App.Mediator = {
        subscribe: function(channel, callback) {
            subscribers.push({ channel: channel, identifier: callback });
            return _mediator.subscribe(channel, callback);
        },

        publish: function (channel, data) {
            return _mediator.publish(channel, data);
        },

        remove: function (channel, identifier) {
            return this.unsubscribe(channel, identifier);
        },

        unsubscribe: function (channel, identifier) {
            return _mediator.remove(channel, identifier);
        },

        once: function (a, b, c, d) {
            return _mediator.once(a, b, c, d);
        },

        clear: function () {
            // un-subscribe all
            for (var i = subscribers.length - 1; i >= 0; i--) {
                this.unsubscribe(subscribers[i].channel, subscribers[i].identifier);
            }
        }
    };
})();
