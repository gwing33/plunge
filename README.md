# Plunge

**WORK IN PROGRESS: Lots to do before it's production ready.**

Plunge is a High Fidelity Event Store, enabling easy rollback.

It could be considered as a Flux Store, but it is more than that.
It's probably more of an Store/Action combination.

This coupled with [react-plunge](https://github.com/gwing33/react-plunge) is my version of Facebook's Relay.

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
  data: bootstrapData
});

let store = Plunge.createContext( Endpoint );

let params = {
  includeSocial: true,
  includeCreditCardNumbers: true,
  includeFamilyHistory: false
};

store.fetch({ query: params }); // In Progress

store.add({
  accountBeenHacked: true;
});

let postData = store.get();
let queryString = {};

store.save({ // In Progress
  data: postData,
  query: queryString
});

let rewindData = store.getRewindState(1); // Not Implimented
// rewindData.accountBeenHacked == false;
// postData.accountBeenHacked == true;

let diffData = store.getDiffState(1); // Not Implimented
// diffData.current.accountBeenHacked = true;
// diffData.prev.accountBeenHacked = false;

// store.del( options ); // In Progress
// store.create( options ); // In Progress
```


### Plunge Documentation
Plunge functions as a singleton, and manages different "stores" for you.
 - ``static createContext( Endpoint ) : PlungeContext``
 - ``static createContexts( [Endpoint] ) : [PlungeContext]``
 - ``static subscribe( function )``
 - ``static add( uri:String, data:Object )``
 - ``static get( uri:String, isExplicit:Bool ) : Object`` - isExplicit will return any matching uri's data scoped.
 - ``static getEvents( String ) : [Object]`` - Gets Events that match exactly the URI
 - ``static getSubEvents( baseUri:String, uri:String ) : [Object]`` - Get Events that don't match exactly but contains the base URI
 - ``static nestObj( baseObj:String, data:Object, uris:[String], i:Number = 0 ) : Object`` - Creates a nested object based on uris
 - ``static splitUri( baseUri:String, uri:String ) : [String]`` - Strip out the baseUri from uri and split the rest into an array.

### Plunge Context Documentation
 - ``constructor( Endpoint )`` - Initializes Context, use Plunge.createContext instead.
 - ``add( data:Object )`` - Pushes data into Plunge
 - ``get() : Object`` - Returns the Data for the context
 - ``rebuild() : Object`` - Will Rebuild data from Source
 - ``addChangeListener( function )`` - Adds a listener to when data for this context has changed.
 - ``fetch( options ) : Promise`` - Forwards to your api.fetch or api.get method,
 - ``save( options ) : Promise`` - Forwards to your api.save or api.update method.
 - ``create( options ) : Promise`` - Forwards to your api.create method.
 - ``del( options ) : Promise`` - Forwards to your api.fetch or api.get method.

### Endpoint Configuration
```javascript
var endpoint = {
  name: 'StoreName',
  uri: '/path/to/data',
  api: {
    get: function () {},
    fetch: function () {},
    save: function () {},
    update: function () {},
    create: function () {},
    del: function () {}
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
- [x] ~~Get, Save, Update & Delete Data.~~
- [x] ~~Trigger from other events, would like to modify addChangeListener to accept an array of data or a single function.~~
- [ ] Local changes vs server value.
- [ ] getUndoState
- [ ] getDiffState
- [ ] Create Example.
