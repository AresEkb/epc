'use strict';

let instanceId = 0;

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
  const log = document.getElementById('log');
  log.value += ['Case ID', 'dd-MM-yyyy:HH.mm', 'Activity'].join(';') + '\n';
  events.pipe(rxjs.operators.filter(ev => ev.kind == 'start'))
    .subscribe({
      next: ev => {
        const values = [
          ev.instanceId,
          new Date().toISOString(),
          ev.name
        ];
        log.value += values.join(';') + '\n';
      }
    });
});
