/* * *
 * Store & PlungeContext
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
 * Creates an instance to more easily call the Store
 * * */
class PlungeContext {
  constructor(endpoint) {
    this.uri = endpoint.uri;
    this.name = endpoint.name;
    this.onChange = false;

    // Subscribe store before getting the data.
    Store.subscribe(x => {
      if(x.valueInternal.uri === this.uri) {
        this.update(x.valueInternal.data);
        if(this.onChange) {
          this.onChange(this, x.valueInternal);
        }
      }
    }.bind(this));

    this.data = Store.get(this.uri);
  }

  /* Add
   * - - -
   * Will update a local version and push out the data to a global store.
   *
   * @param {object} data
   */
  add(data) {
    // Add to global store
    Store.add(this.uri, data);

    // Update local object so we don't have to rebuild entire object.
    this.update(data);
  }

  /* update
   * - - - -
   * @param {object} data
   */
  update(data) {
    _.merge(this.data, data);
  }

  /* Get Interanl Data
   * - - - - - - - - -
   * @return {object}
   */
  get() {
    return this.data;
  }

  /* Rebuild from Store
   * - - - - - - - - - -
   * @return {object}
   */
  rebuild() {
    this.data = Store.get(this.uri);
    return this.get();
  }

  /* Add Change Listener
   * - - - - - - - - - -
   * @param {function} func
   */
  addChangeListener(func) {
    this.onChange = func;
  }
}


/* * *
 * Store
 * - - - - - - - -
 * Store functions as a Singleton.
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
        // let sub_uri = x.uri.replace(uri, '');
        // let uris = sub_uri.split('/');

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
