'use strict';

const events = new rxjs.Subject();

function raiseEvent(kind, name) {
  if (name != null && name != '' && name != 'And' && name != 'Or' && name != 'Xor') {
    events.next({ kind, name });
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

events.subscribe({
  next: ev => console.log(ev)
});

events.subscribe({
  next: ev => {
    if (ev.kind == 'start') {
      const log = document.getElementById('log');
      const values = [
        new Date().toISOString(),
        ev.name
      ];
      log.value += values.join(';') + '\n';
    }
  }
});
