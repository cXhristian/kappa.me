var irc = require('irc');
var Twitch = require('./twitch');

var Chat = function() {
    this.twitch = new Twitch();
    this.kappas = ['Kappa', 'Keepo', 'KappaHD'];

    this.nick = this.generateNick();
    this.password = 'blah'; // can be anything, but twitch defaults to this
    this.server = 'irc.twitch.tv';
    this.twitch.streams(function(channels) {
        this.client = new irc.Client(this.server, this.nick, {
            debug: true,
            userName: this.nick,
            realName: this.nick,
            channels: channels,
            password: this.password
        });
        this.client.addListener('message', function(from, to, message) {
            this.message(from, to, message);
        }.bind(this));
    }.bind(this));
};

Chat.prototype.generateNick = function() {
    return "justinfan" + Math.round(Math.random()*999999);
};

Chat.prototype.containsKappa = function(message) {
    for(var kappa in this.kappas) {
        if(message.indexOf(this.kappas[kappa]) !== -1) {
            return true;
        }
    }
    return false;
};

Chat.prototype.message = function(from, to, message) {
    if(this.containsKappa(message)) {
        console.log('>>>>' + from + ' => ' + to + ': ' + message);
    }
};

var chat = new Chat();
