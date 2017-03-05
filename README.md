```
,____ _   _   _ __   _   ___  _____,
| .  | | | | | |  \ | |/  __|| ____|
|  __| |_| |_| |   \| |  |_--| _|__
|_|  |___|_____|_|\___|\_____|_____|
```

**WORK IN PROGRESS**

Plunge is a High Fidelity Event Store

It could be considered as a Flux Store, but it is more than that.
It's probably more of an Store/Action combination.

### Install
```bash
$ npm i plunge --save
```

### Definitions
- **Schema:** Define your structure
- **Global Stream:** A stream that is mean to handle all the actions.

### Usage

**With a React connector**
```js
import ReactDOM from 'react-dom';
import {Component, PropTypes} from 'react'
import {connectStream} from 'rx-connect-stream';
import {
    getSchemaData,
    registerSchema,
} from 'plunge';

const COUNT_UP = 'COUNT_UP';

registerSchema('counter', {
    default: 0,
    reducers (payload, state) {
        switch (payload.action) {
            case COUNT_UP:
                return state + payload.data;
            case COUNT_DOWN:
                return state - payload.data;
        }
        return state;
    }
});

class MyComponent extends Component {
    static propTypes = {
        counter: PropTypes.number
    };
    handleClick () {
        dispatch({ action: COUNT_UP, data: 1 });
    }
    render () {
        return (
            <div>
                <div>{this.props.counter}</div>
                <button onClick={this.handleClick}>Click me</button>
            </div>
        );
    }
}

const MyNewComponent = connectStream({
    counter: getSchemaData('counter')
})(MyComponent);

ReactDOM.render(
  <MyNewComponent />,
  document.getElementById('root')
);
```


## Tasks
- [ ] Remove lodash
- [ ] Connect stream should be an installable module, or at least plunge specific.
- [ ] Decide if should make everything dependent on Immutable or not.
- [ ] Global actions vs actions specific to a schema?
