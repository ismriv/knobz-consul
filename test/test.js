const expect = require('chai').expect;
const nock = require('nock');
const knobzConsul = require('../lib');

const emptyResponse = [];
const twoFeaturesResponse = [
  {
    'Key': 'conf/flags/feature_one',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgZmVhdHVyZSBvbmUuIiwiZW5hYmxlZCI6dHJ1ZX0='
  },
  {
    'Key': 'conf/flags/feature_two',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgZmVhdHVyZSB0d28uIiwiZW5hYmxlZCI6ZmFsc2V9'
  }
];
const malformedFeaturesResponse = [
  {
    'Key': 'conf/flags/feature_malformed',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXM='
  },
  {
    'Key': 'conf/flags/feature_one',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgZmVhdHVyZSBvbmUuIiwiZW5hYmxlZCI6dHJ1ZX0='
  },
  {
    'Key': 'conf/flags/feature_null',
    'Value': null
  }
];
const withFileExtensionFeaturesResponse = [
  {
    'Key': 'conf/flags/feature_one.json',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgZmVhdHVyZSBvbmUuIiwiZW5hYmxlZCI6dHJ1ZX0='
  }
];
const nullFolderResponse = [
  {
    'Key': 'conf/flags/',
    'Value': null
  }
];

describe('knobz-consul', () => {
  const knobzConsulInstance = knobzConsul({
    host: 'my-consul.dev',
    port: 8555,
    prefix: 'conf/flags/',
    stripFileExtension: true
  });

  after(() => {
    nock.cleanAll();
  });

  describe('#fetchFeatures', () => {
    it('should return an empty array if Consul returns 0 items', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(200, emptyResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.have.length(0);
      });
    });

    it('should return an array with 2 valid features', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(200, twoFeaturesResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([
          {
            id: 'feature_one',
            description: 'This is feature one.',
            enabled: true
          }, {
            id: 'feature_two',
            description: 'This is feature two.',
            enabled: false
          }
        ]);
      });
    });

    it('should include features even if invalid JSON or null', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(200, malformedFeaturesResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([
          {
            id: 'feature_malformed'
          },
          {
            id: 'feature_one',
            description: 'This is feature one.',
            enabled: true
          },
          {
            id: 'feature_null'
          }
        ]);
      });
    });

    it('should strip file extension from feature ID', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(200, withFileExtensionFeaturesResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([
          {
            id: 'feature_one',
            description: 'This is feature one.',
            enabled: true
          }
        ]);
      });
    });

    it('should return an empty array if key does not exist in Consul', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(404);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([]);
      });
    });

    it('should return an empty array if prefix folder is null', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags/?recurse=true&stale=true')
        .reply(200, nullFolderResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([]);
      });
    });
  });
});
