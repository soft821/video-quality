

'use strict';

var ListUser = function() {
    this.command = 'who';

    this.help = function() {
        return '<h2><span class="chatIntCmdName">/' + this.command + '</span></h2>' +
               '<p>Displays a list of the current users with their associated peer IDs</p>';
    };

    this.execute = function(chatObj, argv) {
        var itemTmpl = Handlebars.compile(
            '<li><h2>{{peerId}}</h2><p class="chatIntIndent">({{userName}})</p></li>\n'
        );

        var content = '<div class="chatInternal">';
        content += '<h1>User List</h1>\n';
        content += '<ul>\n';

        // @todo (input): userName is not to be trusted
        var peerMap = chatObj.getPeerIdToUserNameMap();
        for (var peerId in peerMap) {
            if (peerMap.hasOwnProperty(peerId)) {
                content += itemTmpl({
                    peerId: peerId,
                    userName: peerMap[peerId]
                });
            }
        }

        content += '</ul>\n';
        content += '</div>';
        chatObj._appendLine(content);

        return true;
    };

    return this;
};

var _toggleCmdHelp = function(toggle, name) {
    /**
     * Returns command help as an HTML string.
     *
     * @returns {String} Command help.
     */
    return function() {
        return '<h2><span class="chatIntCmdName">/' + toggle.command + '</span> ' +
               '<span class="chatIntCmdArg">newState</span></h2>' +
               '<p>Changes the state of the ' + name + ' to <span class="chatIntCmdArg">newState</span> (boolean value)</p>';
    };
};

var _toggleCmdExecute = function(toggle, name, btn) {
    return function(chatObj, argv) {
        var content = '<div class="chatInternal">';

        if (argv.length === 1) {
            var state = argv[0].toLowerCase();
            if (state === 'on') {
                if (!btn.isSelected()) {
                    btn.clickButton();
                }
                content += '<p>' + name + ' is now <b>ON</b></p>';
            } else if (state === 'off') {
                if (btn.isSelected()) {
                    btn.clickButton();
                }
                content += '<p>' + name + ' is now <b>OFF</b></p>';
            } else {
                content += '<p>Invalid argument for <b>/' + toggle.command + '</b></p>';
            }
        } else {
            content += '<p>' + name + ' is ';
            if (btn.isSelected()) {
                content += '<b>ON</b>';
            } else {
                content += '<b>OFF</b>';
            }

            content += '</p>';
        }

        content += '</div>';
        chatObj._appendLine(content);
        return true;
    };
};

/**
 * Camera toggle.
 *
 * @class
 */
var CameraToggle = function() {
    this.command = 'camera';

    this.help = _toggleCmdHelp(this, 'camera');
    this.execute = _toggleCmdExecute(this, 'Camera', NavBar.cameraBtn);

    return this;
};

/**
 * Microphone toggle.
 *
 * @class
 */
var MicToggle = function() {
    this.command = 'mic';

    this.help = _toggleCmdHelp(this, 'microphone');
    this.execute = _toggleCmdExecute(this, 'Microphone', NavBar.micBtn);

    return this;
};

/**
 * Dashboard toggle.
 *
 * @class
 */
var DashboardToggle = function() {
    this.command = 'dash';

    this.help = _toggleCmdHelp(this, 'dashboard');
    this.execute = _toggleCmdExecute(this, 'Dashboard', NavBar.dashBtn);

    return this;
};

var ChatCommands = {
    _cmds: {},

    _chatObject: null,

    /**
     * Initializes the chat commands object.
     *
     * @param {Object} chatObj - Chat object.
     * @returns {undefined} undefined
     * @public
     */
    initialize: function(chatObj) {
        this._chatObject = chatObj;

        // @todo Add new plugins here
        this.registerCommand(new ListUser());
        this.registerCommand(new CameraToggle());
        this.registerCommand(new MicToggle());
        this.registerCommand(new DashboardToggle());
    },

    /**
     * Registers a chat command.
     *
     * @param {Object} obj - Chat command object.
     * @returns {undefined} undefined
     * @public
     */
    registerCommand: function(obj) {
        var cmd = obj.command.toLowerCase();
        this._cmds[cmd] = obj;
    },

    /**
     * Handles a chat command. Must return true or false to
     * indicate whether the command was handled or not.
     *
     * @param {String} message - Chat command message.
     * @returns {Boolean} True if the command was handled,
     * false otherwise.
     * @public
     */
    handleCommand: function(message) {
        if (!message.length) {
            ErrorMetric.log('ChatCommands.handleCommand => message too small');
            ErrorMetric.log('                              msg: "' + message + '"');
            return false;
        }

        var argv = ShellQuote.parse(message.substring(1));
        if (!argv.length) {
            ErrorMetric.log('ChatCommands.handleCommand => bad message');
            ErrorMetric.log('                              msg: "' + message + '"');
            return false;
        }

        var cmd = argv[0].toLowerCase();
        if (cmd === 'help') {
            var content = '<div class="chatInternal">';
            content += '<h1>Chat Commands</h1>\n<ul>';
            content += '<li><h2><span class="chatIntCmdName">/help</span></h2>' +
                       '<p>Shows this message</p></li>';
            for (var i in this._cmds) {
                if (this._cmds.hasOwnProperty(i)) {
                    content += '<li>' + this._cmds[i].help() + '</li>\n';
                }
            }
            content += '</ul>\n';
            content += '</div>';

            this._chatObject._appendLine(content);
            return true;
        } else {
            var handler = this._cmds[cmd];
            if (handler !== undefined) {
                return handler.execute(this._chatObject, argv.slice(1));
            } else {
                return false;
            }
        }
    },

    handlePeerMessage: function(type, fromPeerId, content) {
        var obj = this._cmds[type];
        if (obj !== undefined && obj.handleMessage !== undefined) {
            // type must be a valid object and also obj.handleMessage must exist
            obj.handleMessage(fromPeerId, content);
        }
    }
};
