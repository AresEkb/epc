const codeEvents = new rxjs.Subject();

let instanceId = 0;
function run(name, maxDelay) {
  name = name || 'Поступил заказ на автоматизацию разработки';
  codeEvents.next({
    name,
    state: { instanceId: ++instanceId, maxDelay }
  });
}

function doWork(maxDelay) {
  return new Promise(resolve => setTimeout(resolve, maxDelay));
}

async function runEvent(name, state) {
  events.next({ kind: 'start', name });
  await doWork(state.maxDelay);
  events.next({ kind: 'end', name, state });
  codeEvents.next({ name, state })
}

async function runFunction(name, state, action) {
  events.next({ kind: 'start', name });
  events.next({ kind: 'active', name });
  await doWork(state.maxDelay);
  const result = typeof action == 'function' ? action() : null;
  events.next({ kind: 'inactive', name });
  events.next({ kind: 'end', name, state, result });
  codeEvents.next({ name, state, result })
}

codeEvents.subscribe({
  next: ev => {
    switch (ev.name) {
      case 'Анализирует требования':
        runEvent('Требования проанализированы', ev.state);
        break;
      case 'Требования проанализированы':
        runFunction('Выбирает подходящую метамодель', ev.state, () => {
          const rnd = Math.round(Math.random() * 2) + 1;
          const result = new Set();
          if (rnd & 1) {
            result.add('Требуемой метамодели нет');
          }
          if (rnd & 2) {
            result.add('Метамодель выбрана');
          }
          return result;
        });
        break;
      case 'Требуемой метамодели нет':
        runFunction('Разрабатывает метамодель', ev.state);
        break;
      case 'Разрабатывает метамодель':
        runEvent('Метамодель разработана', ev.state);
        break;
      case 'Разрабатывает инструментарий':
        runEvent('Разработка инструмента автоматизации завершена', ev.state);
        break;
      case 'Принимает решение об использовании метамодели':
        runFunction('Разрабатывает инструментарий', ev.state);
        break;
      case 'Разработка инструмента автоматизации завершена':
        const waitSet = new Set(['Оценивает результат', 'Демонстрирует результат']);
        const state = { ...ev.state, waitSet };
        runFunction('Оценивает результат', state);
        runFunction('Демонстрирует результат', state);
        break;
      case 'Оценивает результат':
      case 'Демонстрирует результат':
        ev.state.waitSet.delete(ev.name);
        if (ev.state.waitSet.size == 0) {
          delete ev.state.waitSet;
          runFunction('Подводит итоги испытаний', ev.state, () => {
            const rnd = Math.round(Math.random() * 1);
            const results = ['Заказ выполнен', 'Требования уточнены'];
            return results[rnd];
          });
        }
        break;
      case 'Поступил заказ на автоматизацию разработки':
      case 'Требования уточнены':
        runFunction('Анализирует требования', ev.state);
        break;
      case 'Подводит итоги испытаний':
        switch (ev.result) {
          case 'Заказ выполнен':
            runEvent('Заказ выполнен', ev.state);
            break;
          case 'Требования уточнены':
            runEvent('Требования уточнены', ev.state);
            break;
        }
        break;
      case 'Метамодель разработана':
      case 'Метамодель выбрана':
        ev.state.waitSet.delete(ev.name);
        if (ev.state.waitSet.size == 0) {
          delete ev.state.waitSet;
          runFunction('Принимает решение об использовании метамодели', ev.state);
        }
        break;
      case 'Выбирает подходящую метамодель':
        {
          const waitSet = new Set();
          if (ev.result.has('Требуемой метамодели нет')) {
            waitSet.add('Метамодель разработана');
          }
          if (ev.result.has('Метамодель выбрана')) {
            waitSet.add('Метамодель выбрана');
          }
          const state = { ...ev.state, waitSet };
          for (const res of ev.result) {
            switch (res) {
              case 'Требуемой метамодели нет':
                runEvent('Требуемой метамодели нет', state);
                break;
              case 'Метамодель выбрана':
                runEvent('Метамодель выбрана', state);
                break;
            }
          }
        }
        break;
    }
  }
});
