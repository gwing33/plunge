/* * *
 * Plunge & PlungeContext
 * - - - - - - - - - - -
 * This is to provide a general store implimentation
 *   to be utilized primarly in a Flux type sytem.
 * Few key differences between a flux system and this,
 *   is there are no actions, they get muddled into the store.
 * * */
'use strict';
import _ from 'lodash';
import Bacon from 'baconjs';

var _eventData = [];
var _events = new Bacon.Bus();
var _plungeContexts = {};

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

    this.data = Plunge.getState(this.uri);
    this.prevData = Plunge.getState(this.uri, 1);

    // Add default data before the listener.
    if(endpoint.data) {
      this.add(endpoint.data);
    }

    // Add any listener specified
    if(endpoint.listeners) {
      this.addChangeListeners(endpoint.listeners);
    }

    // Subscribe store before getting the data.
    this.unsubscribe = Plunge.subscribe(x => {
      var xv = x.valueInternal;
      if(typeof this.onChange[xv.uri] == 'function') {
        if(xv.uri == this.uri) {
          this.onChange[xv.uri]({
            uri: this.uri,
            data: this.data
          }, {
            uri: this.uri,
            data: this.prevData
          });
        } else {
          this.onChange[xv.uri]({
            uri: xv.uri,
            data: Plunge.getStateFromStore(xv.uri)
          }, {
            uri: xv.uri,
            data: Plunge.getPrevStateFromStore(xv.uri)
          });
        }
      }
    }.bind(this));
  }

  /* Add
   * - - -
   * Will update a local version and push out the data to a global store.
   *
   * @param {object} data
   */
  add(data) {
    this.prevData = _.clone(this.data);
    _.merge(this.data, data);

    // Add to global store
    Plunge.add(this.uri, data);
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

  fetch(options = {}) {
    var fetch = this.api.get || this.api.fetch || false;
    if(fetch) {
      this.add({ isFetching: true, hasError: false, apiOptions: options });
      return this.apiReturn( fetch(options), { isFetching: false });
    }
  }

  save(options = {}) {
    var save = this.api.save || this.api.update || false;
    if(save) {
      this.add({ isSaving: true, hasError: false, apiOptions: options });
      return this.apiReturn( save(options), { isSaving: false });
    }
  }

  create(options = {}) {
    if(this.api.create) {
      this.add({ isCreating: true, hasError: false, apiOptions: options });
      return this.apiReturn( this.api.create(options), { isCreating: false });
    }
  }

  del(options = {}) {
    if(this.api.del) {
      this.add({ isDeleting: true, hasError: false, apiOptions: options });
      return this.apiReturn( this.api.del(options), { isDeleting: false });
    }
  }

  apiReturn(apiPromise, data) {
    return apiPromise.then((res) => {
                       this.add(_.merge({ hasError: false }, data, res));
                     })
                     .catch((err) => {
                       this.add(_.merge({ hasError: true, error: err }, data));
                     });
  }
}


/* * *
 * Plunge
 * - - - - - - - -
 * Plunge functions as a Singleton.
 * But you can create StoreContexts for ease of use.
 * The purpose of this is to centeralize all the data and be able to replay or rebuild data sets.
 * * */
class Plunge {
  /* Create a PlungeContext
   * - - - - - - - - - - -
   * Will manage different contexts
   *
   * @param {object} endpoint
   *
   * @return {PlungeContext}
   */
  static createContext(endpoint, forceNew = false) {
    if(!_plungeContexts[endpoint.uri]) {
      _plungeContexts[endpoint.uri] = new PlungeContext(endpoint);
    } else if(forceNew) {
      delete _plungeContexts[endpoint.uri];
      _plungeContexts[endpoint.uri] = new PlungeContext(endpoint);
    }

    return _plungeContexts[endpoint.uri];
  }

  /* Create an Array of PlungeContext
   * - - - - - - - - - - - - - - - -
   * @param {[object]} endpoints
   *
   * @return {[PlungeContext]}
   */
  static createContexts(endpoints) {
    return endpoints.map(endpoint => {
      return Plunge.createContext(endpoint);
    });
  }

  /* Wrapper for the Event Bus
   * - - - - - - - - - - - - -
   * @param {function} func
   *
   * @return {function} - unsubscribe function...
   */
  static subscribe(func) {
    // Subscribe function to any Event matching the URI.
    return _events.subscribe(func);
  }

  /* Add Event Data Point
   * - - - - - - - - - - -
   * Will add the event data point to the global store.
   * Will push an event to all subscribers
   *
   * @param {string} uri
   * @param {object} data
   */
  static add(uri, data) {
    let eventData = {
      uri: uri,
      data: data
    };

    // Push to the data store
    _eventData.push(eventData);

    // Push event out
    _events.push(eventData);
  }

  /* Get a complied data object from the event store
   * - - -
   * @param {string} uri
   * @param {bool} isExplicit - optional
   *
   * @return {object}
   */
  static getState(uri, offset = 0, isExplicit = false) {
    let obj = {};
    let evts = Plunge.getEvents(uri);

    _.map(evts, (e, num) => {
      if(evts.length - offset > num) {
        _.merge(obj, e.data);
      }
    });

    if(isExplicit) {
      _.map(Plunge.getSubEvents(uri), x => {
        let uris = Plunge.splitUri(uri, x.uri);
        let baseObj = {};

        Plunge.nestObj(baseObj, x.data, uris);
        _.merge(obj, baseObj);
      });
    }

    return obj;
  }

  /* Get Current State From Store
   * - - - - - - - - - - - - - - -
   * @param {string} uri
   *
   * @return {object}
   */
  static getStateFromStore(uri) {
    return _plungeContexts[uri] ? _plungeContexts[uri].getState() : Plunge.get(uri);
  }

  static getPrevStateFromStore(uri, offset = 1) {
    return _plungeContexts[uri] ? _plungeContexts[uri].getPrevState() : Plunge.get(uri, offset);
  }

  /* Get Events
   * - - - - - -
   * Find any direct uri match
   *
   * @param {string} uri
   *
   * @return {array}
   */
  static getEvents(uri) {
    return _.filter(_eventData, e => {
      return e.uri == uri;
    });
  }

  /* Get Sub events
   * - - - - - - - -
   * Return anything that is not a direct URI match.
   *
   * @param {string} uri
   *
   * @return {array}
   */
  static getSubEvents(uri) {
    return _.filter(_eventData, e => {
      return e.uri !== uri && e.uri.indexOf(uri) > -1;
    });
  }

  /* Nest Object
   * - - - - - -
   * Creates an object base on number of URIs you pass in.
   *
   * @param {object} baseObj
   * @param {object} data
   * @param {array} uris
   * @param {number} i (optional)
   *
   * @return {bool}
   */
  static nestObj(baseObj, data, uris, i = 0) {
    let isMax = uris.length - 1 == i;
    baseObj[uris[i]] = isMax ? data : {};

    return isMax ? true : Plunge.nestObj(baseObj[uris[i]], data, uris, i + 1);
  }

  /* Split up URI
   * - - - - - - -
   * @param {string} baseUri
   * @param {string} uri
   *
   * @return {[string]}
   */
  static splitUri(baseUri, uri) {
    let new_uri = uri.replace(baseUri, '');
    if(new_uri.charAt(0) === "/") {
      new_uri = new_uri.substring(1, new_uri.length);
    }
    return new_uri.split('/');
  }
}

export default Plunge;
