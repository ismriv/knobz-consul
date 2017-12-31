const https = require('https');
const axios = require('axios');

module.exports = function knobConsul(opts) {
  const scheme = opts.secure ? 'https' : 'http';
  const host = opts.host || '127.0.0.1';
  const port = opts.port || 8500;
  const baseUrl = `${scheme}://${host}:${port}/v1/kv`;
  const timeout = opts.timeout || 10000;
  const prefix = (opts.prefix || '').replace(/^\/+/g, ''); // remove all leading slashes

  const axiosOptions = {
    baseURL: baseUrl,
    timeout: timeout,
    params: {
      recurse: true
    }
  };
  if (opts.secure) {
    axiosOptions.httpsAgent = new https.Agent({
      ca: opts.ca
    });
  }
  const axiosClient = axios.create(axiosOptions);

  function fetchFeatures() {
    return axiosClient.get(prefix).then((response) => {
      return response.data.map((item) => {
        return Object.assign(parseValueAsJson(item.Value), {
          id: removePrefixFromKey(prefix, item.Key)
        });
      });
    });
  }

  return {
    fetchFeatures
  };
};

function removePrefixFromKey(prefix, key) {
  return key.slice(prefix.length + 1);
}

function parseValueAsJson(value) {
  try {
    return JSON.parse(decode(value));
  } catch (err) {
    return {};
  }
}

function decode(value) {
  if (typeof value !== 'string') {
    return value;
  }
  return new Buffer(value, 'base64').toString();
}
