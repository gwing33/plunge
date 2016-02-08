import { Observable, ReplaySubject } from 'rx';
import Cycle from '@cycle/core';



function makePlungeDriver(model) {
  // Add the model

  return (stream) => {
    stream.subscribe((msg) => {
      console.log('Driver Sink Plunge:', msg);
    })

    return {
      get: () => {
        return stream.map((msg) => 'Hello' + msg.value);
      },

      set: () => {
        stream.onNext({ value: 1000 });
      }
    };
  }
}


function main({ plunge }) {
  plunge.get().subscribe((msg) => {
    console.log('Main Source Plunge Get:', msg);
  });

  return {
    plunge: new ReplaySubject(1),
  };
}

const cycle = Cycle.run(main, {
  plunge: makePlungeDriver({})
});


cycle.sources.plunge.get().subscribe((msg) => {
  console.log('Source Plunge Get:', msg);
});

cycle.sinks.plunge.subscribe((msg) => {
  console.log('Sink Plunge:', msg);
});

// console.log(cycle.sinks.plunge);

cycle.sinks.plunge.onNext({ value: 2000 })

cycle.sources.plunge.set()
