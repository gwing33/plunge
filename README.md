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
TODO


### Plunge Documentation
 - ``createContext(Endpoint)``
 - ``createContexts([Endpoint])``
 - ``subscribe(function)``
 - ``add(uri:String, data:Object)``
 - ``get(uri:String, isExplicit:Bool)`` - isExplicit will return any matching uri's data scoped.
 - ``getEvents(uri:String)`` - Gets Events that match exactly the URI
 - ``getSubEvents(baseUri:String, uri:String)`` - Get Events that don't match exactly but contains the base URI
 - ``nestObj(baseObj:String, data:Object, uris:[String], i:Number = 0)`` - Creates a nested object based on uris
 - ``splitUri(baseUri:String, uri:String)`` - Strip out the baseUri from uri and split the rest into an array.

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
