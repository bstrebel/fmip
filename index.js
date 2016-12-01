var https = require('https');
var _ = require('lodash');

var fmip = {
    device: function(apple_id, password, device, callback) {
        fmip.devices(apple_id, password, function (error, devices) {
            if (error) {
                return callback(error);
            } else {
                var found = _.find(devices, {'name': device});
                if (found) {
                    return callback(null, found);
                } else {
                    var error = new Error();
                    error.type = "NOTFOUND";
                    error.message = "iCloud device [" + device + "] not found!";
                    return callback(error);
                }
            }
        });
    },
    devices: function (apple_id, password, callback) {
        fmip.client(apple_id, password, function (error, response) {
            if (error) {
                return callback(error);
            } else {
                callback(null, response.content);
            }
        });
    },
    client: function(apple_id, password, callback) {
        var opts = {
            method: 'POST',
            host: "fmipmobile.icloud.com",
            path: "/fmipservice/device/" + apple_id + "/initClient",
            headers: {
                Authorization: 'Basic ' + new Buffer(apple_id + ':' + password).toString('base64')
            }
        };
        var hostRequest = https.request(opts, function (response) {
            opts.host = response.headers['x-apple-mme-host'];
            var deviceRequest = https.request(opts, function (response) {
                var result = {headers: response.headers, body: ''};
                response.on('data', function (chunk) {
                    result.body = result.body + chunk;
                });
                response.on('end', function () {
                    return callback(null, JSON.parse(result.body));
                });
            });
            deviceRequest.on('error', function (error) {
                error.originalMessage = error.message;
                error.type = "AUTH";
                error.message = "iCloud service error [" + apple_id + "]";
                return callback(error)
            });
            deviceRequest.end();
        });
        hostRequest.on('error', function (error) {
            error.originalMessage = error.message;
            error.type = "CONNECT";
            error.message = "iCloud connect error [" + error.message + "]";
            return callback(error)
        });
        hostRequest.end();
    }
};

module.exports = fmip;
