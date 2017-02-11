/* * *
 * globalStream
 * - - - - - - -
 * All actions go through a single pipeline.
 * * */

import { ReplaySubject } from 'rxjs';
import { List, Map } from 'immutable';

const _globalStream = new ReplaySubject(1);

export const globalStream = _globalStream
  // Immutable or bust.
  .filter(payload => Map.isMap(payload))
  // Everything should have an action
  .filter(payload => !!payload.get('action'))
  .do(console.log);
