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
                    var err = new Error();
                    err.type = "NOTFOUND";
                    err.message = "iCloud device [" + device + "] not found!";
                    return callback(err);
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
        var err = null;
        var hostRequest = https.request(opts, function (response) {
            if (response.statusCode < 400) {
                var host = response.headers['x-apple-mme-host'];
                if (host) {
                    opts.host = host;
                    var deviceRequest = https.request(opts, function (response) {
                        if (response.statusCode === 200) {
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
                                    error.message = "iCloud data error from host [" + host + "]";
                                    if (result.body) error.message += ": \"" + result.body + "\"";
                                    return callback(error);
                                }
                            });
                        } else {
                            err = new Error();
                            if (response.statusCode === 401) { err.type = "AUTH" } else { err.type = "DATA" }
                            err.message = "iCloud data error " + response.statusCode + " for [" + apple_id + "]: " + response.statusMessage;
                            return callback(err);
                        }
                    });
                    deviceRequest.on('error', function (error) {
                        error.originalMessage = error.message;
                        error.type = "DATA";
                        error.message = "iCloud service error [" + apple_id + "]";
                        return callback(error);
                    });
                    deviceRequest.end();
                } else {
                    err = new Error();
                    err.type = "HOST";
                    err.message = "iCloud host error [" + apple_id + "]";
                    return callback(err);
                }
            } else {
                err = new Error();
                if (response.statusCode === 401) { err.type = "AUTH" } else { err.type = "HOST" }
                err.message = "iCloud host error " + response.statusCode + " for ID [" + apple_id + "]: " + response.statusMessage;
                return callback(err);
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
