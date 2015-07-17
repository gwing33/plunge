# Plunge

**WORK IN PROGRESS: Lots to do before it's production ready.**

Plunge is a High Fidelity Event Store, enabling easy rollback.

It could be considered as a Flux Store, but it is more than that.
It's probably more of an Store/Action combination.

This coupled with [react-plunge](https://github.com/gwing33/react-plunge) is my version of Facebook's Relay which I know very little about....

### Install
```bash
npm install plunge --save
```

### PROPOSED Usage

```javascript
import Plunge from 'plunge';
import { api } from './plugins/api';

let id = 123;
let bootstrapData = {};
let Endpoint = api({
  name: 'NSAPersonStore',
  uri: `/personal/${id}/info`,
  data: bootstrapData,
  listeners: [
    (data, prevData) => {},
    {
      // Maybe make this a matching uri? I.E. '/company/:id/info'
      uri: '/company/enron/info',
      onChange: (data, prevData) => {}
    }
  ]
});

let store = Plunge.createContext( Endpoint );

let params = {
  includeSocial: true,
  includeCreditCardNumbers: true,
  includeFamilyHistory: false
};

store.fetch({ query: params }); // Needs Tests

store.add({
  accountBeenHacked: true;
});

let postData = store.getState();
let queryString = {};

store.save({ // Needs Tests
  data: postData,
  query: queryString
});

let rewindData = store.getState(1); // Gets Previous State
// rewindData.accountBeenHacked == false;
// postData.accountBeenHacked == true;

let diffData = store.getDiffState(1); // Not Implemented
// diffData.current.accountBeenHacked = true;
// diffData.prev.accountBeenHacked = false;

// store.del( options ); // Needs Tests
// store.create( options ); // Needs Tests
```


### Plunge Documentation
Plunge functions as a singleton, and manages different "stores" for you.
 - ``static createContext( Endpoint ) : PlungeContext``
 - ``static createContexts( [Endpoint] ) : [PlungeContext]``
 - ``static subscribe( function )``
 - ``static add( uri:String, data:Object )``
 - ``static getState( uri:String, offset = 0, isExplicit = false ) : Object`` - isExplicit will return any matching uri's data scoped.
 - ``static getStateFromStore( uri:String )``
 - ``static getPrevStateFromStore( uri:String, offset = 1 )``
 - ``static getEvents( String ) : [Object]`` - Gets Events that match exactly the URI
 - ``static getSubEvents( baseUri:String, uri:String ) : [Object]`` - Get Events that don't match exactly but contains the base URI
 - ``static nestObj( baseObj:String, data:Object, uris:[String], i:Number = 0 ) : Object`` - Creates a nested object based on uris
 - ``static splitUri( baseUri:String, uri:String ) : [String]`` - Strip out the baseUri from uri and split the rest into an array.

### Plunge Context Documentation
 - ``constructor( Endpoint )`` - Initializes Context, use Plunge.createContext instead.
 - ``add( data:Object )`` - Pushes data into Plunge
 - ``getStore(offset = 0) : Object`` - Returns the Data for the context
 - ``getPrevStore() : Object`` - Returns the Previous Data for the context
 - ``rebuild() : Object`` - Will Rebuild data from Source
 - ``rebuildPrev() : Object`` - Will Rebuild data from Source
 - ``addChangeListener( function )`` - Adds a listener to when data for this context has changed.
 - ``get( options ) : Promise`` - Forwards to your api.fetch or api.get method,
 - ``fetch( options ) : Promise`` - Forwards to your api.fetch or api.get method,
 - ``update( options ) : Promise`` - Forwards to your api.save or api.update method.
 - ``save( options ) : Promise`` - Forwards to your api.save or api.update method.
 - ``create( options ) : Promise`` - Forwards to your api.create method.
 - ``del( options ) : Promise`` - Forwards to your api.fetch or api.get method.

### Endpoint Configuration
```javascript
var endpoint = {
  name: 'StoreName',
  uri: '/path/to/data',
  api: {
    get: function (options) {},
    fetch: function (options) {},
    save: function (options) {},
    update: function (options) {},
    create: function (options) {},
    del: function (options) {}
  }
  data: {
    // ... any data you want to initialize with.
  },
  listeners: [{ // Pass an object...
    uri: 'string',
    onChange: (prevData, data) => {
      // Do Something
    }
  }, (prevData, data) => { // Or just a function. This will bind it to your uri path.
    // Do Something
  }]
};
```

### Plugins
There is an api plugin to use out of the gate with Plunge. But you can create your own API plugin as you see fit.

## What About Validation?
I think validation should be it's own declarative thing defined in the component.
Plunge is not in the business of validating data correctness.

## TODO
- [x] ~~Create a Singleton that Stores all the hifi data.~~
- [x] ~~Create a context or scope type class that wraps the singleton.~~
- [x] ~~Get sub-events if requested.~~
- [x] ~~Create config documentation / standards.~~
- [x] ~~Get, Fetch, Save, Update, Create & Delete Data.~~
- [x] ~~Trigger from other events, would like to modify addChangeListener to accept an array of data or a single function.~~
- [ ] Write tests around api plugin and api PlungeContext actions. (In Progress)
- [ ] Create way to extend the library to fetch specific kinds of data (getDiffState, getPrevStateFromServer).
- [ ] SubEventState - Right now Getting sub events has no connection to the offset that gets passed in.
- [ ] Create Example.
