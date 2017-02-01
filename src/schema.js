import {globalStream} from './globalStream';

const PLUNGE_SCHEMA_ACTION = 'PLUNGE_SCHEMA_ACTION'

export const plungeSchema = {
    stream () {
        return globalStream.filter(({action}) => action === PLUNGE_SCHEMA_ACTION);
    },
    add (schema) {
        globalStream.next({action: PLUNGE_SCHEMA_ACTION, data: schema});
    }
};
