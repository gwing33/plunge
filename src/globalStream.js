/* * *
 * globalStream
 * - - - -
 * All actions go through a single pipeline.
 * * */

import { Observer, ReplaySubject } from 'rx';

/* * * Root stream * * */
let _readWriteStream = null;


/* Get Read Stream wrapper
 * - - - - - - - - - - - -
 * @return {Observable}
 */
function _getReadStream() {
  globalStream.init();

  return _readWriteStream.asObservable();
}

/* Get Write Stream wrapper
 * - - - - - - - - - - - - -
 * @return {Observer}
 */
function _getWriteStream() {
  globalStream.init();

  return _readWriteStream.asObserver();
}

export const globalStream = {
  init: (scheduler = false) => {
    if (scheduler || _readWriteStream === null) {
      _readWriteStream = new ReplaySubject(1, null, scheduler);
    }
  },

  /* Get Stream
   * - - - - - -
   * @return {Observable}
   */
  getStream: () => {
    return _getReadStream();
  },

  /* Do Dispatch (write stream onNext)
   * - - - - - - - - - - - - - - - - -
   * @param {object} Message to add in the pipeline
   */
  doDispatch: (message) => {
    _getWriteStream().onNext(message);
  },
};
