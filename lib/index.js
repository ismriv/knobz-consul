const https = require('https');
const axios = require('axios');

module.exports = function knobConsul({
  secure = false,
  ca,
  host = '127.0.0.1',
  port = 8500,
  timeout = 10000,
  prefix = '',
  stripFileExtension = false
} = {}) {
  const scheme = secure ? 'https' : 'http';
  const baseUrl = `${scheme}://${host}:${port}/v1/kv`;
  const prefixWithSlash = ensureTrailingSlash(prefix || '');

  const axiosOptions = {
    baseURL: baseUrl,
    timeout: timeout,
    params: {
      recurse: true,
      stale: true
    }
  };
  if (secure && ca) {
    axiosOptions.httpsAgent = new https.Agent({
      ca: ca
    });
  }
  const axiosClient = axios.create(axiosOptions);
  const isNotFoundError = axiosError => axiosError.response && axiosError.response.status === 404;

  function fetchFeatures() {
    return axiosClient.get(prefixWithSlash).then((response) => {
      return response.data;
    }).catch((axiosError) => {
      if (isNotFoundError(axiosError)) {
        return [];
      }
      throw axiosError;
    }).then((items) => {
      const isKeyInFolder = item => item.Key !== prefixWithSlash;

      return items.filter(isKeyInFolder).map((item) => {
        const itemKey = stripFileExtension ? stripFileExtensionFromName(item.Key) : item.Key;
        const featureId = removePrefixFromKey(prefixWithSlash, itemKey);

        return Object.assign({}, parseValueAsJson(item.Value), {
          id: featureId
        });
      });
    });
  }

  return {
    fetchFeatures
  };
};

function ensureTrailingSlash(str) {
  if (str.substr(-1) !== '/') {
    return `${str}/`;
  }
  return str;
}

function removePrefixFromKey(prefix, key) {
  return key.slice(prefix.length);
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

function stripFileExtensionFromName(str) {
  const dotIndex = str.lastIndexOf('.');
  if (dotIndex < 0) {
    return str;
  }
  return str.substring(0, dotIndex);
}
