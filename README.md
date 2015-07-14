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


## TODO
- [x] Create a Singleton that Stores all the hifi data.
- [x] Create a context or scope type class that wraps the singleton.
- [ ] Get sub-events if requested. (In Progress)
- [ ] Create config documentation / standards. (In Progress)
- [ ] Get, Save, Update & Delete Data
- [ ] Data Validation
- [ ] Trigger from other events
- [ ] Local changes vs server value.
- [ ] Create Example.
