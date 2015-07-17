import _ from 'lodash';
import Plunge from './Plunge';

/* * *
 * PlungeContext
 * - - - - - - -
 * Creates an instance to more easily call the Plunge
 * * */
class PlungeContext {
  constructor(endpoint) {
    this.uri = endpoint.uri;
    this.name = endpoint.name;
    this.onChange = {};
    this.api = endpoint.api || false;

    // Add default data before the listener and before I get Data
    if(endpoint.data) {
      this.add(endpoint.data);
    }

    this.data = Plunge.getState(this.uri);
    this.prevData = Plunge.getState(this.uri, 1);

    // Add any listener specified
    if(endpoint.listeners) {
      this.addChangeListeners(endpoint.listeners);
    }

    // Subscribe store before getting the data.
    this.unsubscribe = Plunge.subscribe(this.listener.bind(this));
  }

  /* Add
   * - - -
   * Will update a local version and push out the data to a global store.
   *
   * @param {object} data
   */
  add(data) {
    // Add to global store
    Plunge.add(this.uri, data);
  }

  /* Update State
   * - - - - - - -
   * @param {object} data
   */
  updateState(data) {
    this.prevData = _.clone(this.data);
    _.merge(this.data, data);
  }

  /* Get Interanl Data
   * - - - - - - - - -
   * @return {object}
   */
  getState() {
    return this.data;
  }

  /* Get Interanl Data
   * - - - - - - - - -
   * @return {object}
   */
  getPrevState() {
    return this.prevData;
  }

  /* Rebuild from Plunge
   * - - - - - - - - - -
   * @return {object}
   */
  rebuild() {
    this.data = Plunge.getState(this.uri);
    return this.getState();
  }

  rebuildPrev() {
    this.prevData = Plunge.getState(this.uri, 1);
    return this.getPrevState();
  }

  /* Listener
   * - - - - -
   * Main listener that gets sent to Plunge
   */
  listener(evt) {
    var e = evt.valueInternal;
    if(typeof this.onChange[e.uri] == 'function') {
      if(e.uri == this.uri) {
        this.onChange[e.uri]({
          uri: this.uri,
          data: this.data
        }, {
          uri: this.uri,
          data: this.prevData
        });
      } else {
        this.onChange[e.uri]({
          uri: e.uri,
          data: Plunge.getStateFromStore(e.uri)
        }, {
          uri: e.uri,
          data: Plunge.getPrevStateFromStore(e.uri)
        });
      }
    }
  }

  /* Add Change Listener
   * - - - - - - - - - -
   * @params {function} args
   * @params {string, function} args
   * @params {{uri:String, onChange:function}} args
   */
  addChangeListener() {
    if(typeof arguments[0] == 'function') {
      this.onChange[this.uri] = arguments[0];
    } else if(typeof arguments[0] == 'string' && typeof arguments[1] == 'function') {
      this.onChange[arguments[0]] = arguments[1];
    } else if(typeof arguments[0] == 'object') {
      this.onChange[arguments[0].uri] = arguments[0].onChange;
    }
  }

  /* Add Change Listeners
   * - - - - - - - - - - -
   * @params {[function]} onChanges
   * @params {[{string, function}]} onChanges
   */
  addChangeListeners(onChanges) {
    _.map(onChanges, x => { this.addChangeListener(x); }.bind(this));
  }

  /* Remove Change Listener
   * - - - - - - - - - - - -
   * @param {string} uri
   */
  removeChangeListener(uri) {
    delete this.onChange[uri];
  }

  unsubscribe() {
    this.unsubscribe();
  }

  /* * *
   * REST Call Wrappers
   * - - - - - - - - - -
   * These will only be called if an API is specified
   */

  get() { return this.fetch(arguments[0]); }
  fetch(options = {}) {
    var fetch = this.api.get || this.api.fetch || false;
    if(fetch) {
      this.add({ isLoading: true, isFetching: true, hasError: false, apiOptions: options });
      return this.apiReturn( fetch(options), { isFetching: false });
    }
    return false;
  }

  update() { return this.save(arguments[0]); }
  save(options = {}) {
    var save = this.api.save || this.api.update || false;
    if(save) {
      this.add({ isLoading: true, isSaving: true, hasError: false, apiOptions: options });
      return this.apiReturn( save(options), { isSaving: false });
    }
    return false;
  }

  create(options = {}) {
    if(this.api.create) {
      this.add({ isLoading: true, isCreating: true, hasError: false, apiOptions: options });
      return this.apiReturn( this.api.create(options), { isCreating: false });
    }
    return false;
  }

  del(options = {}) {
    if(this.api.del) {
      this.add({ isLoading: true, isDeleting: true, hasError: false, apiOptions: options });
      return this.apiReturn( this.api.del(options), { isDeleting: false });
    }
    return false;
  }

  apiReturn(apiPromise, data) {
    return apiPromise.then((res) => {
                       this.add(_.merge({ isLoading: false, hasError: false }, data, res));
                     })
                     .catch((err) => {
                       this.add(_.merge({ isLoading: false, hasError: true, error: err }, data));
                     });
  }
}

export default PlungeContext
