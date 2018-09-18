'use strict';

var twoDigitNum = function(num) {
    var out = '' + num;
    if (out.length === 1) {
        out = '0' + out;
    }
    return out;
};

/**
 * Creates a new clock item in the navbar.
 *
 * @class
 */
var Clock = {
    UPDATE_INTERVAL: 5, /* update very 5 seconds */

    timeLabel: $('#timeLabel'),

    /**
     * Initializes the clock.
     *
     * @returns {undefined} undefined
     * @public
     */
    initialize: function() {
        this.update();
    },

    /**
     * Updates the time for representation in the UI.
     *
     * @returns {undefined} undefined
     * @public
     */
    update: function() {
        var _this = this;
        var date = new Date();
        var timeString = twoDigitNum(date.getHours()) + ':' + twoDigitNum(date.getMinutes());
        this.timeLabel.text(timeString);
        setTimeout(function() {
            _this.update();
        }, this.UPDATE_INTERVAL * 1000);
    }
};
