import React, { Component, PropTypes } from 'react';
import plunge from 'plunge';
import { Map } from 'immutable';

plunge.registerSchema('counter', {
  default: 0,
  reducer (payload, state) {
    switch (payload.get('action')) {
      case 'COUNT_UP':
        return state + 1;
      case 'COUNT_DOWN':
        return state - 1;
    }
    return state;
  }
});

class App extends Component {
  static propTypes = {
    counter: PropTypes.number
  };
  handlePosClick () {
    plunge.dispatch(Map({
      action: 'COUNT_UP'
    }));
  }
  handleNegClick () {
    plunge.dispatch(Map({
      action: 'COUNT_DOWN'
    }));
  }
  render() {
    return (
      <div style={{margin: '20px auto', width: '100px', textAlign: 'center'}}>
        {this.props.counter}
        <br />
        <button onClick={this.handlePosClick}>+1</button>
        {' '}
        <button onClick={this.handleNegClick}>-1</button>
      </div>
    );
  }
}

export default plunge.connect({
  counter: plunge.getSchemaData('counter')
})(App);
