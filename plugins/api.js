'use strict';
import _ from 'lodash';
import superagent from 'superagent';

export function api(options) {
  if(!options.uri) {
    return false;
  }

  if(!options.api) {
    options.api = {};
  }

  _.merge(options.api, {
    get: (apiOptions = {}) => {
      return new Promise((resolve, reject) => {
        superagent.get(options.uri)
                  .query(apiOptions.query)
                  //.accept('json')
                  .end((err, res) => {
                    return err ? reject(err) : resolve(res);
                  });
      });

    },
    post: (apiOptions = {}) => {
      return new Promise((resolve, reject) => {
        superagent.post(options.uri)
                  .query(apiOptions.query)
                  .send(apiOptions.data)
                  //.accept('json')
                  .end((err, res) => {
                    return err ? reject(err) : resolve(res);
                  });
      });
    },
    put: (apiOptions = {}) => {
      return new Promise((resolve, reject) => {
        superagent.put(options.uri)
                  .query(apiOptions.query)
                  .send(apiOptions.data)
                  //.accept('json')
                  .end((err, res) => {
                    return err ? reject(err) : resolve(res);
                  });
      });
    },
    del: () => {
      return new Promise((resolve, reject) => {
        superagent.del(options.uri)
                  .end((err, res) => {
                    return err ? reject(err) : resolve(res);
                  });
      });
    }
  });

  return true;
}
