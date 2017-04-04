var irc = require('irc');
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var twitch = require('./twitch');

var emotes = [];
// Let's just hope this finishes before any clients start spitting out kappas
// enterprise level coding
twitch.emoticons(function(data) {
    emotes = data;
});

var ChatManager = function() {
    EventEmitter.call(this);
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
    twitch.streams(function(channels) {
        for(var i = 0; i < this.maxClients; i++) {
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
        this.emit('kappa', {nick: from, message: this.emoteParser(message)});
    }
};

Chat.prototype.emoteParser = function(message) {
    var messageEmotes = {};
    for (var i = 0; i < emotes.length; i++) {
        if(emotes[i].id == 10) {
            // awful hack
            continue;
        }
        var indices = [];
        var index = message.indexOf(emotes[i].code);
        while(index !== -1) {
            indices.push(index);
            index = message.indexOf(emotes[i].code, index + 1);
        }
        for(var b = 0; b < indices.length; b++) {
            var index = indices[b];
            var end = emotes[i].code.length;
            if(messageEmotes[index] === undefined || messageEmotes[index].end < end) {
                messageEmotes[index] = {
                    emote: i,
                    end: end
                };
            }
        }
    }
    var offset = 0;
    for(var start in messageEmotes) {
        var messageEmote = messageEmotes[start];
        start = Number(start);
        var emoteMarkup = '<img src="https://static-cdn.jtvnw.net/emoticons/v1/' + emotes[messageEmote.emote].id + '/1.0" alt="' + emotes[messageEmote.emote].code + '">';
        message = message.substring(0, start + offset) + emoteMarkup + message.substring(offset + start + messageEmote.end, message.length);
        offset += emoteMarkup.length - messageEmote.end;
    }
    return message;
};

Chat.prototype.disconnect = function() {
    this.client.disconnect(); // ?
};

module.exports = ChatManager;
