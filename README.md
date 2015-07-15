# Plunge

**WORK IN PROGRESS: Lots to do before it's production ready.**

Plunge is a Event Store, it keeps a high fidelity data on the application, enabling easy rollback.

It could be considerd as a Flux Store, but it is more than that.
It's probably more of an Store/Action combination.

I guess this is my version of facebook's future Relay they keep talking about.

### Install
```bash
npm install plunge
```

### Usage
```javascript
import Plunge from 'plunge';

let Endpoint = {
  name: 'NSAPersonStore',
  uri: '/personal/info'
};

let store = Plunge.createContext( Endpoint );
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
  data: {
    // ... any data you want to initialize with.
  }
}
```

## TODO
- [x] Create a Singleton that Stores all the hifi data.
- [x] Create a context or scope type class that wraps the singleton.
- [x] Get sub-events if requested.
- [ ] Create config documentation / standards. (In Progress)
- [ ] Get, Save, Update & Delete Data
- [ ] Data Validation
- [ ] Trigger from other events
- [ ] Local changes vs server value.
- [ ] Create Example.
