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
                return callback(null, response.content);
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
            var host = response.headers['x-apple-mme-host'];
            if (host) {
                opts.host = host;
                var deviceRequest = https.request(opts, function (response) {
                    var result = {headers: response.headers, body: ''};
                    response.on('data', function (chunk) {
                        result.body = result.body + chunk;
                    });
                    response.on('end', function () {
                        try {
                            var data = JSON.parse(result.body);
                            return callback(null, data);
                        }
                        catch (error) {
                            error.type = "DATA";
                            error.originalMessage = error.message;
                            error.message = "iCloud data error from [" + host + "]: \"" + result.body + "\"";
                            return callback(error);
                        }
                    });
                });
                deviceRequest.on('error', function (error) {
                    error.originalMessage = error.message;
                    error.type = "AUTH";
                    error.message = "iCloud service error [" + apple_id + "]";
                    return callback(error);
                });
                deviceRequest.end();
            } else {
                var error = new Error();
                error.type = "HOST";
                error.message = "iCloud host error [" + apple_id + "]";
                return callback(error);
            }
        });
        hostRequest.on('error', function (error) {
            error.originalMessage = error.message;
            error.type = "CONNECT";
            error.message = "iCloud connect error [" + error.message + "]";
            return callback(error);
        });
        hostRequest.end();
    }
};

module.exports = fmip;
