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

import PlungeContext from './PlungeContext';
var _eventData = [];
var _events = new Bacon.Bus();
var _plungeContexts = {};


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

    if(_plungeContexts[uri]) {
      _plungeContexts[uri].updateState(data);
    }

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
