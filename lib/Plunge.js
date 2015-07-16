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
    this.onChange = false;
    this.api = false;

    if(endpoint.api) {
      this.api = endpoint.api;
    }

    // Subscribe store before getting the data.
    Plunge.subscribe(x => {
      if(x.valueInternal.uri === this.uri) {
        _.merge(this.data, x.data);

        if(this.onChange) {
          this.onChange(this, x.valueInternal);
        }
      }
    }.bind(this));

    this.data = Plunge.get(this.uri);
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

    // Update local object so we don't have to rebuild entire object.
    _.merge(this.data, data);
  }

  /* Get Interanl Data
   * - - - - - - - - -
   * @return {object}
   */
  get() {
    return this.data;
  }

  /* Rebuild from Plunge
   * - - - - - - - - - -
   * @return {object}
   */
  rebuild() {
    this.data = Plunge.get(this.uri);
    return this.get();
  }

  /* Add Change Listeners
   * - - - - - - - - - - -
   *
   */

  /* Add Change Listener
   * - - - - - - - - - -
   * @param {function} func
   */
  addChangeListener(func) {
    this.onChange = func;
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
  static createContext(endpoint) {
    if(!_plungeContexts[endpoint.uri]) {
      _plungeContexts[endpoint.uri] = new PlungeContext(endpoint);
    }

    if(endpoint.data) {
      Plunge.add(endpoint.uri, endpoint.data);
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
   */
  static subscribe(func) {
    // Subscribe function to any Event matching the URI.
    _events.subscribe(func);
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
  static get(uri, isExplicit = false) {
    let obj = {};

    _.map(Plunge.getEvents(uri), e => {
      _.merge(obj, e.data);
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
