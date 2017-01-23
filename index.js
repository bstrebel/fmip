/*jslint node: true*/
"use strict";

var _ = require("lodash");

var fmip = {

    icloud: require("find-my-iphone").findmyphone,

    device: function (apple_id, password, device, callback) {
        //noinspection JSLint

        fmip.icloud.apple_id = apple_id;
        fmip.icloud.password = password;

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

        fmip.icloud.apple_id = apple_id;
        fmip.icloud.password = password;

        try {
            fmip.icloud.getDevices(function(error, devices) {
                if (error) {
                    var err = new Error();
                    err.type = "ICLOUD";
                    err.message = "iCloud error [" + error + "] for [" + apple_id + "]";
                    return callback(err);
                } else {
                    return callback(null, devices);
                }
            });
        }
        catch (err) {
            return err;
        }
    },
    client: function (apple_id, password, callback) {

        fmip.icloud.apple_id = apple_id;
        fmip.icloud.password = password;
    }
};

module.exports = fmip;
