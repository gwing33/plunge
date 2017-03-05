import {globalStream} from './globalStream';
import {Map} from 'immutable';
import {Observable} from 'rxjs';

const PLUNGE_SCHEMA_ACTION = 'PLUNGE_SCHEMA_ACTION'

export function registerSchema (name, metadata) {
    globalStream.next(createSchemaPayload(name, metadata));
}

export function getSchemaData (name) {
  return () => {
    return schemaStream
      .filter(schema => !!schema.get(name))
      .map(schema => schema.get(name))
      .flatMap(schema => {
        const defaultValue = schema.has('default') ? schema.get('default') : Map({});
        return Observable.of(defaultValue)
          .merge(globalStream)
          .scan((acc, x) => {
            if (x && x.get && x.get('action')) {
              return schema.get('reducer') ? schema.get('reducer')(x, acc) : acc;
            }
            return acc;
          }, defaultValue);
      });
  }
}

export function createSchemaPayload (name, metadata = {}) {
  if (typeof name !== 'string') {
    console.warn('Schema name must exist and have a name.');
    return;
  }

  return Map({
    action: PLUNGE_SCHEMA_ACTION,
    data: Map({name, metadata})
  });
}

export const schemaStream = globalStream
  .filter(payload => payload.get('action') === PLUNGE_SCHEMA_ACTION)
  .scan((schemas, payload) => {
    const data = payload.get('data');
    return schemas.merge({
      [data.get('name')]: data.get('metadata')
    });
  }, Map({}));
