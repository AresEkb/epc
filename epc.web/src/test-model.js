const codeEvents = new rxjs.Subject();

function run(name) {
  runEvent(name || 'поступил заказ на автоматизацию разработки',
    { instanceId: ++instanceId });
}

function doWork() {
  return new Promise(resolve => setTimeout(resolve, maxDelay));
}

async function runEvent(name, state) {
  const instanceId = state.instanceId;
  events.next({ kind: 'start', name, instanceId });
  await doWork();
  events.next({ kind: 'end', name, instanceId });
  codeEvents.next({ name, state })
}

async function runFunction(name, state, action) {
  const instanceId = state.instanceId;
  events.next({ kind: 'start', name, instanceId });
  events.next({ kind: 'active', name, instanceId });
  await doWork();
  const result = typeof action == 'function' ? action() : null;
  events.next({ kind: 'inactive', name, instanceId });
  events.next({ kind: 'end', name, instanceId });
  codeEvents.next({ name, state, result })
}

codeEvents.subscribe({
  next: ev => {
    switch (ev.name) {
      case 'анализирует требования':
        runEvent('требования проанализированы', ev.state);
        break;
      case 'требования проанализированы':
        runFunction('выбирает подходящую метамодель', ev.state, () => {
          const rnd = Math.round(Math.random() * 2) + 1;
          const result = new Set();
          if (rnd & 1) {
            result.add('метамодель выбрана');
          }
          if (rnd & 2) {
            result.add('требуемой метамодели нет');
          }
          return result;
        });
        break;
      case 'требуемой метамодели нет':
        runFunction('разрабатывает метамодель', ev.state);
        break;
      case 'разрабатывает метамодель':
        runEvent('метамодель разработана', ev.state);
        break;
      case 'принимает решение об использовании метамодели':
        runFunction('разрабатывает инструментарий', ev.state);
        break;
      case 'разрабатывает инструментарий':
        runEvent('разработка инструмента автоматизации завершена', ev.state);
        break;
      case 'поступил заказ на автоматизацию разработки':
      case 'требования уточнены':
        runFunction('анализирует требования', ev.state);
        break;
      case 'выбирает подходящую метамодель':
        {
          const waitSet = new Set();
          if (ev.result.has('метамодель выбрана')) {
            waitSet.add('метамодель выбрана');
          }
          if (ev.result.has('требуемой метамодели нет')) {
            waitSet.add('метамодель разработана');
          }
          const state = { ...ev.state, waitSet };
          for (const res of ev.result) {
            switch (res) {
              case 'метамодель выбрана':
                runEvent('метамодель выбрана', state);
                break;
              case 'требуемой метамодели нет':
                runEvent('требуемой метамодели нет', state);
                break;
            }
          }
        }
        break;
      case 'метамодель выбрана':
      case 'метамодель разработана':
        ev.state.waitSet.delete(ev.name);
        if (ev.state.waitSet.size == 0) {
          delete ev.state.waitSet;
          runFunction('принимает решение об использовании метамодели', ev.state);
        }
        break;
      case 'разработка инструмента автоматизации завершена':
        const waitSet = new Set(['демонстрирует результат', 'оценивает результат']);
        const state = { ...ev.state, waitSet };
        runFunction('демонстрирует результат', state);
        runFunction('оценивает результат', state);
        break;
      case 'демонстрирует результат':
      case 'оценивает результат':
        ev.state.waitSet.delete(ev.name);
        if (ev.state.waitSet.size == 0) {
          delete ev.state.waitSet;
          runFunction('подводит итоги испытаний', ev.state, () => {
            const rnd = Math.round(Math.random() * 1);
            const results = ['требования уточнены', 'заказ выполнен'];
            return results[rnd];
          });
        }
        break;
      case 'подводит итоги испытаний':
        switch (ev.result) {
          case 'требования уточнены':
            runEvent('требования уточнены', ev.state);
            break;
          case 'заказ выполнен':
            runEvent('заказ выполнен', ev.state);
            break;
        }
        break;
    }
  }
});
