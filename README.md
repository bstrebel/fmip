## fmip: find my iphone

Get location information (and more) from an iCloud device without triggering Apple alerts!
Based on [Thomas Henley's iphone-finder](https://github.com/ThomasHenley/node-iphone-finder). Thanks!

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

