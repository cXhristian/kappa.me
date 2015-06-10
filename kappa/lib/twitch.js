var https = require('https');

var Twitch = function() {
    this.api = 'https://api.twitch.tv/kraken/';
};

Twitch.prototype.streams = function(callback) {
    var url = this.generateUrl('streams', {
        limit: 10,
        on_site: 1 // no idea what this does
    });
    this.request(url, function(streamsJSON) {
        var channels = [];
        var streams = streamsJSON['streams'];
        for(var stream in streams) {
            // irc channels
            channels.push('#' + streams[stream]['channel']['name']);
        }
        callback(channels);
    });
};

Twitch.prototype.generateUrl = function(type, options) {
    var params = [];
    for(var key in options) {
        if(options.hasOwnProperty(key)) {
            params.push(key + '=' + options[key]);
        }
    }
    return this.api + type + '?' + params.join('&');
};

Twitch.prototype.request = function(url, callback) {
    https.get(url, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        }); 

        res.on('end', function() {
            // All data has been received
            callback(JSON.parse(body));
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
};

module.exports = Twitch;
