'use strict';

let instanceId = 0;
let maxDelay = 500;

const events = new rxjs.Subject();

function raiseEvent(kind, name) {
  if (name != null && name != '' && name != 'And' && name != 'Or' && name != 'Xor') {
    events.next({ kind, name, instanceId });
  }
}

function raiseStartEvent(d) {
  raiseEvent('start', d.name);
}

function raiseActiveEvent(d) {
  raiseEvent('active', d.name);
}

function raiseInactiveEvent(d) {
  raiseEvent('inactive', d.name);
}

function raiseEndEvent(d) {
  raiseEvent('end', d.name);
}

// events.subscribe({
//   next: ev => console.log(ev)
// });

document.addEventListener('DOMContentLoaded', () => {
  const delay = document.getElementById('delay');
  delay.addEventListener('input', () => {
    maxDelay = +delay.value;
  });

  const log = document.getElementById('log');
  log.value += ['timestamp', 'case', 'activity'].join(';') + '\n';
  events.pipe(rxjs.operators.filter(ev => ev.kind == 'start'))
    .subscribe({
      next: ev => {
        const values = [
          new Date().toISOString(),
          ev.instanceId,
          ev.name
        ];
        log.value += values.join(';') + '\n';
      }
    });
});
