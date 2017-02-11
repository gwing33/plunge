import {globalStream} from './globalStream';
import {Map} from 'immutable';

const PLUNGE_SCHEMA_ACTION = 'PLUNGE_SCHEMA_ACTION'

export function createSchemaPayload (name, metadata) {
  if (typeof name !== 'string') {
    console.warn('Schema name must exist and have a name.');
    return;
  }
  if (!Map.isMap(metadata)) {
    console.warn('Schema metadata must be an Immutable Map');
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
