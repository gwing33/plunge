import {globalStream} from './globalStream';
import {connectStream} from './connectStream';
import {
  getSchemaData,
  registerSchema,
} from './schemaStream';
import { Map } from 'immutable';

export default {
  registerSchema,
  getSchemaData,
  dispatch () {
    const payload = (typeof arguments[0] === 'string')
      ? Map({ action: arguments[0], data: arguments[1] || {} })
      : arguments[0];

    globalStream.next(payload);
  },
  connect: connectStream
};
