## fmip: find my iphone

**Deprecated**: Broken since January 2017 due to iCloud API changes. Replaced
by [icloud-promise](https://www.npmjs.com/package/icloud-promise).

~~Get location information (and more) from an iCloud device!~~

As of Rev. 3.0.0 _fmip_ is just a [pimatic-phone](https://www.npmjs.com/package/pimatic-phone) compatible wrapper around
[find-my-phone](https://github.com/matt-kruse/find-my-iphone). It's just work-a-round for the old API call which seams to be
no longer supported with the beginning of 2017.

**Limitations**

- Generates Apple alert emails on login
- Two factor authentication not supported
- Only one session for one account supported

Further investigation required. A reworked library supporting multiple accounts
and Two Factor Authentication is in progress.

~~Based on [Thomas Henley's iphone-finder](https://github.com/ThomasHenley/node-iphone-finder). Thanks!~~

### Installation

```bash
	npm install fmip
```

### Summary

Use iCloud fmipservice to get device information.

### Example

Here's a basic example using all the methods

```javascript

var fmip = require('fmip');

fmip.device(apple_id, password, device, function(error, device) {
    if (error) {
        console.log(error.message);
    } else {
        console.log(device.location);
    }
});

```

