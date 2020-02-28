function isEpcObject(obj, eClassName) {
  return obj.eClass == 'http://www.example.org/epc#//' + eClassName;
}

function resolveRef(root, ref) {
  let current = root;
  for (const step of ref['$ref'].split('/')) {
    if (step.length == 0) {
      continue;
    }
    if (step.startsWith('@')) {
      const [feature, index] = step.split('.');
      current = current[feature.substring(1)][index];
    }
    else {
      current = current[step];
    }
  }
  return current;
}

function toFirstUpper(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/, d => '-' + d.toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {

  const svg = d3.select('#epc-diagram')
  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const simulation = d3.forceSimulation()
    // .force('link', d3.forceLink().id(d => d.id).distance(20).strength(2.5))
    .force('link', d3.forceLink().distance(20).strength(d => d.kind == 'controlFlow' ? 2.5 : 0.1))
    // .force('link', d3.forceLink().id(d => d.id).distance(20).strength(d => {
    //   // console.log(d);
    //   return d.source.y > d.target.y ? 0.5 : 2.5;
    // }))
    .force('charge', d3.forceManyBody().strength(d => d.kind == 'event' || d.kind == 'function' ? -70 : -120))
    .force('center', d3.forceCenter(width / 2, height / 2))
    // .force('x', d3.forceX(width / 2).strength(0.15))
    .force('x', d3.forceX(width / 2).strength(d => d.kind == 'event' || d.kind == 'function' ? 0.15 : 0))
    // .force('y', d3.forceY(height / 2).strength(d => {
    //   console.log(d);
    //   return d.source.y > d.target.y ? 0 : 0.2;
    // }))

  d3.json('model.json').then(function (model) {

    const nodeMap = new Map();
    const links = [];

    for (const root of model) {
      if (isEpcObject(root, 'Model')) {
        for (const obj of root.elements) {
          if (isEpcObject(obj, 'Event')) {
            nodeMap.set(obj, {
              kind: 'event',
              name: obj.name
            });
          }
          else if (isEpcObject(obj, 'Function')) {
            nodeMap.set(obj, {
              kind: 'function',
              name: obj.name
            });
          }
          // else if (isEpcObject(obj, 'OrganizationUnit')) {
          //   nodeMap.set(obj, {
          //     kind: 'organizationUnit',
          //     name: obj.name
          //   });
          // }
          // else if (isEpcObject(obj, 'System')) {
          //   nodeMap.set(obj, {
          //     kind: 'system',
          //     name: obj.name
          //   });
          // }
          // else if (isEpcObject(obj, 'Resource')) {
          //   nodeMap.set(obj, {
          //     kind: obj.kind != null ? obj.kind : 'resource',
          //     name: obj.name
          //   });
          // }
          else if (isEpcObject(obj, 'Gate')) {
            nodeMap.set(obj, {
              kind: obj.kind != null ? obj.kind : 'and',
              name: obj.name
            });
            for (const input of obj.inputs) {
              links.push({
                kind: 'controlFlow',
                source: resolveRef(model, input),
                target: obj
              });
            }
            for (const output of obj.outputs) {
              links.push({
                kind: 'controlFlow',
                source: obj,
                target: resolveRef(model, output)
              });
            }
          }
          else if (isEpcObject(obj, 'ControlFlow')) {
            links.push({
              kind: 'controlFlow',
              source: resolveRef(model, obj.source),
              target: resolveRef(model, obj.target)
            });
          }
          // else if (isEpcObject(obj, 'Participation')) {
          //   links.push({
          //     kind: 'participation',
          //     source: resolveRef(model, obj.source),
          //     target: resolveRef(model, obj.target)
          //   });
          // }
          // else if (isEpcObject(obj, 'InformationFlow')) {
          //   links.push({
          //     kind: 'informationFlow',
          //     source: resolveRef(model, obj.source),
          //     target: resolveRef(model, obj.target)
          //   });
          // }
          // else if (isEpcObject(obj, 'Association')) {
          //   links.push({
          //     kind: 'association',
          //     source: resolveRef(model, obj.source),
          //     target: resolveRef(model, obj.target)
          //   });
          // }
        }
      }
    }
    const nodes = [...nodeMap.values()];
    const initial = new Set(nodes.filter(d => d.kind == 'event' || d.kind == 'function'));
    const final = new Set(nodes.filter(d => d.kind == 'event' || d.kind == 'function'));
    for (const link of links) {
      link.source = nodeMap.get(link.source);
      link.target = nodeMap.get(link.target);
      initial.delete(link.target);
      final.delete(link.source);
    }

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('g')
      .data(links, d => d.id)
      .enter().append('g')
        .attr('class', d => 'link ' + toSnakeCase(d.kind) + '-link')
        .append('line')
          .attr('marker-end', 'url(#arrow)');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('svg')
      .data(nodes, d => d.id)
      .enter().append('svg')
        .attr('class', d => 'node ' + toSnakeCase(d.kind) + '-node')
        .attr('viewBox', '0 0 50 30')
        .attr('width', 30)
        .attr('height', 18)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
    node.append('use')
      .attr('href', d => 'images/' + toFirstUpper(d.kind) + '.svg#shape')
      .append('title')
        .text(d => d.name);

    simulation
      .nodes(nodes)
      .on('tick', update);

    simulation.force('link')
      .links(links);

    simulation.force('bounding-box', alpha => {
      const size = 15;
      for (const node of nodes) {
        node.x = Math.max(Math.min(node.x, width - size), size);
        node.y = Math.max(Math.min(node.y, height - size), size);
      }
    });

    simulation.force('top-bottom', alpha => {
      const k = 16 * alpha;
      links.forEach(function(d, i) {
        if (d.kind == 'informationFlow') {
          // d.source.y = d.target.y;
        }
        else if (d.kind == 'participation') {
          // d.source.y = d.target.y;
        }
      });
    });

    // simulation.force('weak-bottom-up', alpha => {
    //   const k = 16 * alpha;
    //   links.forEach(function(d, i) {
    //     d.source.y -= k;
    //     d.target.y += k;
    //   });
    // });

    simulation.force('initial', alpha => {
      for (const node of initial) {
        node.y = 20;
      }
      for (const node of final) {
        node.y = height - 20;
      }
    });

    simulation.force('collision', d3.forceCollide().radius(20));

    events.subscribe({
      next: ev => {
        const node = nodes.find(d => d.name == ev.name);
        if (node != null) {
          node.active = ev.kind == 'start' || ev.kind == 'active';
          updateState();
        }
      }
    });

    function update() {
      link
        .attr('x1', d => d.source.x.toFixed(2))
        .attr('y1', d => d.source.y.toFixed(2))
        .attr('x2', d => d.target.x.toFixed(2))
        .attr('y2', d => d.target.y.toFixed(2));
      node
        .attr('x', d => d.x.toFixed(2) - 9)
        .attr('y', d => d.y.toFixed(2) - 9);
    }

    function updateState() {
      node.classed('active', d => d.active);
    }
  });

  let x0 = null;
  let y0 = null;

  function dragstarted(d) {
    x0 = d.x;
    y0 = d.y;
  }

  function dragged(d) {
    if (x0 != null && (Math.abs(d3.event.x - x0) > 3 || Math.abs(d3.event.y - y0) > 3)) {
      simulation.alphaTarget(0.3).restart();
      x0 = null;
      y0 = null;
    }
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    if (!d3.event.sourceEvent.ctrlKey) {
      d.fx = null;
      d.fy = null;
    }
  }

  document.getElementById('run').addEventListener('click', () => run(null, 500));
});
