/*jslint node: true*/
"use strict";

var https = require("https");
var _ = require("lodash");

var fmip = {
    error: function (apple_id, request, response) {
        var err = new Error();
        if (response.statusCode === 401 || response.statusCode === 403) {
            err.type = "AUTH";
        } else {
            err.type = request.toUpperCase();
        }
        err.message = "iCloud " + request + " error [" + response.statusCode + "] for AppleID [" + apple_id + "]: ";
        err.message += response.statusMessage;
        return err;
    },
    device: function (apple_id, password, device, callback) {
        //noinspection JSLint
        fmip.devices(apple_id, password, function (error, devices) {
            if (error) {
                return callback(error);
            } else {
                var found = _.find(devices, {"name": device});
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
    client: function (apple_id, password, callback) {
        var opts = {
            method: "POST",
            host: "fmipmobile.icloud.com",
            path: "/fmipservice/device/" + apple_id + "/initClient",
            headers: {
                Authorization: "Basic " + new Buffer(apple_id + ":" + password).toString("base64")
            }
        };
        var hostRequest = https.request(opts, function (response) {
            if (response.statusCode < 400) {
                var host = response.headers["x-apple-mme-host"];
                if (host) {
                    opts.host = host;
                    var deviceRequest = https.request(opts, function (response) {
                        if (response.statusCode === 200) {
                            var result = {headers: response.headers, body: ""};
                            response.on("data", function (chunk) {
                                result.body = result.body + chunk;
                            });
                            response.on("end", function () {
                                try {
                                    var data = JSON.parse(result.body);
                                    return callback(null, data);
                                } catch (error) {
                                    error.type = "DATA";
                                    error.originalMessage = error.message;
                                    error.message = "iCloud data error from host [" + host + "]";
                                    if (result.body) {
                                        error.message += ": \"" + result.body + "\"";
                                    }
                                    return callback(error);
                                }
                            });
                        } else {
                            return callback(fmip.error(apple_id, "data", response));
                        }
                    });
                    deviceRequest.on("error", function (error) {
                        error.originalMessage = error.message;
                        error.type = "DATA";
                        error.message = "iCloud service error [" + apple_id + "]";
                        return callback(error);
                    });
                    deviceRequest.end();
                } else {
                    return callback(fmip.error(apple_id, "host", response));
                }
            } else {
                return callback(fmip.error(apple_id, "host", response));
            }
        });
        hostRequest.on("error", function (error) {
            error.originalMessage = error.message;
            error.type = "CONNECT";
            error.message = "iCloud connect error [" + error.message + "]";
            return callback(error);
        });
        hostRequest.end();
    }
};

module.exports = fmip;
