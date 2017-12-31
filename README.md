# knobz-consul
Storage engine for [knobz](https://github.com/ismriv/knobz)'s features flags library backed by Consul KV.

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

By default, __knobz-consul__ uses [stale](https://www.consul.io/api/index.html#stale) consistency mode for higher availability and scalable reads. This mode allows reads without a leader, meaning a cluster that is unavailable will still be able to respond.

## Quick Start

Install the module using npm:

```bash
$ npm install knobz-consul --save
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

## License

[MIT](LICENSE)
