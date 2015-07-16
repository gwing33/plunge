# Plunge

**WORK IN PROGRESS: Lots to do before it's production ready.**

Plunge is a Event Store, it keeps a high fidelity data on the application, enabling easy rollback.

It could be considerd as a Flux Store, but it is more than that.
It's probably more of an Store/Action combination.

I guess this is my version of facebook's future Relay they keep talking about.

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
let Endpoint = {
  name: 'NSAPersonStore',
  uri: `/personal/${id}/info`,
  api: API, // Or create your own API interface
  data: bootstrapData
};

let store = Plunge.createContext( Endpoint );

let params = api({
  includeSocial: true,
  includeCreditCardNumbers: true,
  includeFamilyHistory: false
});

store.fetch({ query: params }); // Not Implimented

store.add({
  accountBeenHacked: true;
});

let postData = store.get();
let queryString = {};

store.save({ // Not Implimented
  data: postData,
  query: queryString
});

let rewindData = store.getRewindState(1); // Not Implimented
// rewindData.accountBeenHacked == false;
// postData.accountBeenHacked == true;

let diffData = store.getDiffState(1); // Not Implimented
// diffData.current.accountBeenHacked = true;
// diffData.prev.accountBeenHacked = false;

// store.del( options ); // Not Implimented
// store.create( options ); // Not Implimented
```


### Plunge Documentation
Plunge functions as a singleton, and manages different "stores" for you.
 - ``static createContext(Endpoint)``
 - ``static createContexts([Endpoint])``
 - ``static subscribe(function)``
 - ``static add(uri:String, data:Object)``
 - ``static get(uri:String, isExplicit:Bool)`` - isExplicit will return any matching uri's data scoped.
 - ``static getEvents(uri:String)`` - Gets Events that match exactly the URI
 - ``static getSubEvents(baseUri:String, uri:String)`` - Get Events that don't match exactly but contains the base URI
 - ``static nestObj(baseObj:String, data:Object, uris:[String], i:Number = 0)`` - Creates a nested object based on uris
 - ``static splitUri(baseUri:String, uri:String)`` - Strip out the baseUri from uri and split the rest into an array.

### Plunge Context Documentation
 - ``constructor(Endpoint)`` - Initializes Context, use Plunge.createContext instead.
 - ``add(data:Object)`` - Pushes data into Plunge
 - ``get()`` - Returns the Data for the context
 - ``rebuild()`` - Will Rebuild data from Source
 - ``addChangeListener(function)`` - Adds a listener to when data for this context has changed.

### Endpoint Configuration
```javascript
var endpoint = {
  name: 'StoreName',
  uri: '/path/to/data',
  ApiHandler: API,
  data: {
    // ... any data you want to initialize with.
  },
  listeners: [{ // Not Implimented
    uri: '/path/to/related/data',
    onChange: function(data) {
      // Do Something
    }
  }]
};
```

## TODO
- [x] ~~Create a Singleton that Stores all the hifi data.~~
- [x] ~~Create a context or scope type class that wraps the singleton.~~
- [x] ~~Get sub-events if requested.~~
- [x] ~~Create config documentation / standards.~~
- [ ] Get, Save, Update & Delete Data. (In Progress)
- [ ] Trigger from other events, would like to modify addChangeListener to accept an array of data or a single function. (In Progress)
- [ ] Local changes vs server value.
- [ ] getUndoState
- [ ] getDiffState
- [ ] Create Example.

## What About Validation?
I think validation should be it's own declarative thing defined in the component.
Plunge is not in the business of validating data correctness.
