var irc = require('irc');
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Twitch = require('./twitch');

var ChatManager = function() {
    EventEmitter.call(this);
    this.twitch = new Twitch();
    this.maxClients = 5;
    this.maxChannels = 10;
    this.clients = [];
    // Reset every 1 hour to keep Kappas fresh
    setInterval(function() {
        this.reset();
    }.bind(this), 60*60*1000);
    this.start();
};
util.inherits(ChatManager, EventEmitter);


ChatManager.prototype.reset = function() {
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].disconnect();
    }
    this.clients = [];
    this.start();
};

ChatManager.prototype.start = function() {
    this.twitch.streams(function(channels) {
        for(var i = 0; i < this.maxClients; i++) {
            console.log(i, channels.slice(i * this.maxChannels, (i + 1) * this.maxChannels))
            var client = new Chat(channels.slice(i * this.maxChannels, (i + 1) * this.maxChannels));
            client.on('kappa', function(data) {
                // Probably a horrible way to handle events
                this.emit('kappa', data);
            }.bind(this));
            this.clients.push(client);
        }
    }.bind(this), this.maxClients * this.maxChannels);
};

var Chat = function(channels) {
    EventEmitter.call(this);
    this.kappas = ['Kappa', 'Keepo'];

    this.nick = this.generateNick();
    this.password = 'blah'; // can be anything, but twitch defaults to this
    this.server = 'irc.twitch.tv';
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
};

util.inherits(Chat, EventEmitter);

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
        this.emit('kappa', {nick: from, message: message});
    }
};

Chat.prototype.disconnect = function() {
    this.client.disconnect(); // ?
};

module.exports = ChatManager;
