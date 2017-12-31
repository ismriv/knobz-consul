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
const malformedFeatureResponse = [
  {
    'Key': 'conf/flags/feature_malformed',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXM='
  },
  {
    'Key': 'conf/flags/feature_one',
    'Value': 'eyJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgZmVhdHVyZSBvbmUuIiwiZW5hYmxlZCI6dHJ1ZX0='
  }
];

describe('knobz-consul', () => {
  const knobzConsulInstance = knobzConsul({
    host: 'my-consul.dev',
    port: 8555,
    prefix: 'conf/flags'
  });

  after(() => {
    nock.cleanAll();
  });

  describe('#fetchFeatures', () => {
    it('should return an empty array if Consul returns 0 items', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags?recurse=true')
        .reply(200, emptyResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.have.length(0);
      });
    });

    it('should return an array with 2 features', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags?recurse=true')
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

    it('should include features even if JSON parsing fails', () => {
      nock('http://my-consul.dev:8555')
        .get('/v1/kv/conf/flags?recurse=true')
        .reply(200, malformedFeatureResponse);

      return knobzConsulInstance.fetchFeatures().then((features) => {
        expect(features).to.eql([
          {
            id: 'feature_malformed'
          },
          {
            id: 'feature_one',
            description: 'This is feature one.',
            enabled: true,
          }
        ]);
      });
    });
  });
});
