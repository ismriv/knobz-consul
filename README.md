# knobz-consul
Storage engine for [knobz](https://github.com/ismriv/knobz)'s features flags library backed by Consul KV.

[![Build Status](https://travis-ci.org/ismriv/knobz-consul.svg?branch=master)](https://travis-ci.org/ismriv/knobz-consul)
[![Dependency Status](https://gemnasium.com/badges/github.com/ismriv/knobz-consul.svg)](https://gemnasium.com/github.com/ismriv/knobz-consul)

Store your feature flags as individual keys under a common prefix (e.g. config/feature-flags), as in the following example.

```bash
/
|-- config/
|    |-- feature-flags/
|    |    |-- featureOne
|    |    |-- featureTwo
|    |-- database/
|         |-- mysql
+-- vault
```

__knobz-consul__ will then recursively read all keys with the same prefix, parse the value of each key to JSON, and return an array with all the features to be used by __knobz__.

By default, __knobz-consul__ uses [stale consistency mode](https://www.consul.io/api/index.html#stale) when reading from Consul KV for higher availability and scalable reads. This mode allows reads without a leader, meaning a cluster that is unavailable will still be able to respond.

## Quick Start

Install the module using npm:

```shell
npm install knobz-consul --save
```

Usage example in Node.js:

```js
const knobz = require('knobz');
const knobzConsul = require('knobz-consul')({
  host: '127.0.0.1',
  port: 8500,
  prefix: 'config/feature-flags/'
});

knobz.configure({
  features: knobzConsul.fetchFeatures,
  reloadInterval: 30000
}).then(() => {
  // features have been loaded from Consul KV and will be refreshed every 30s
});
```

## knobzConsul([options])

Initialize a new Knobz's Consul client.

### Options

* `host` (String, default: 127.0.0.1): agent address
* `port` (Integer, default: 8500): agent HTTP(S) port
* `secure` (Boolean, default: false): enable HTTPS
* `ca` (String, optional): string with trusted certificates in PEM format
* `timeout` (Integer, default: 10000): timeout in ms for read requests to Consul KV
* `prefix` (String, default: /): prefix used to store the feature flags

## License

[MIT](LICENSE)
