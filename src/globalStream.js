/* * *
 * globalStream
 * - - - - - - -
 * All actions go through a single pipeline.
 * * */

import { ReplaySubject } from 'rxjs';

const _globalStream = new ReplaySubject(1);

export const globalStream = _globalStream
  // Everything should have an action
  .filter(payload => !!payload.action)
  // Make sure data exists, but not required
  .map(payload => {
      return {
          action: payload.action,
          data: payload.data || {}
      };
  });
