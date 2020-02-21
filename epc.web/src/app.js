'use strict';

const events = new rxjs.Subject();

events.subscribe({
  next: v => console.log(v)
});

events.subscribe({
  next: v => {
    const log = document.getElementById('log');
    const values = [
      new Date().toISOString(),
      v.name
    ];
    log.value += values.join(';') + '\n';
  }
});

document.addEventListener('DOMContentLoaded', () => {

const svg = d3.select('svg')
const width = +svg.attr('width');
const height = +svg.attr('height');

const simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id(d => d.id).distance(d => 50))
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2));

d3.json('petri-net.json').then(function (graph) {

  const nodes = [];
  const links = [];
  for (const place of graph.places) {
    nodes.push(Object.assign({ kind: 'place', count: 0 }, place));
  }
  for (const transition of graph.transitions) {
    const node = Object.assign({ kind: 'transition' }, transition);
    node.inputs = transition.inputs.map(input => nodes.find(p => p.id == input));
    node.outputs = transition.outputs.map(output => nodes.find(p => p.id == output));
    nodes.push(node);
    for (const input of transition.inputs) {
      links.push({ source: input, target: transition.id });
    }
    for (const output of transition.outputs) {
      links.push({ source: transition.id, target: output });
    }
  }

  const arc = svg.append('g')
    .attr('class', 'links')
    .selectAll('g')
    .data(links)
    .enter().append('g')
      .attr('class', 'arc')
      .append('line')
        .attr('stroke-width', d => Math.sqrt(d.value))
        .attr('marker-end', 'url(#arrow)');

  const place = svg.append('g')
    .attr('class', 'places')
    .selectAll('svg')
    .data(nodes.filter(d => d.kind == 'place'))
    .enter().append('svg')
      .attr('class', 'place')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', d => { d.count++; update(); });
  place.append('circle')
    .attr('cx', 10)
    .attr('cy', 10)
    .attr('r', 9)
    .append('title')
      .text(d => d.name);
  const marking = place.append('text')
    .attr('x', 10)
    .attr('y', 10);
  marking.append('title')
    .text(d => d.name);
  marking.append('tspan')
    .text(d => d.count);

  const transition = svg.append('g')
    .attr('class', 'transitions')
    .selectAll('svg')
    .data(nodes.filter(d => d.kind == 'transition'))
    .enter().append('svg')
      .attr('class', 'transition')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', fire);
  transition.append('rect')
    .attr('x', 1)
    .attr('y', 1)
    .attr('width', 18)
    .attr('height', 18)
    .append('title')
      .text(d => d.name);

  simulation
    .nodes(nodes)
    .on('tick', update);

  simulation.force('link')
    .links(links);

  function update() {
    arc
      .attr('x1', d => d.source.x.toFixed(2))
      .attr('y1', d => d.source.y.toFixed(2))
      .attr('x2', d => d.target.x.toFixed(2))
      .attr('y2', d => d.target.y.toFixed(2));
    place
      .attr('x', d => d.x.toFixed(2) - 10)
      .attr('y', d => d.y.toFixed(2) - 10);
    place.select('tspan')
      .text(d => d.count);
    transition
      .attr('x', d => d.x.toFixed(2) - 10)
      .attr('y', d => d.y.toFixed(2) - 10)
      .classed('enabled', enabled);
  }

  function enabled(d) {
    const required = {};
    for (const input of d.inputs) {
      required[input.id] = required[input.id] ? required[input.id] + 1 : 1;
    }
    return d.inputs.every(input => input.count >= required[input.id]);
  }

  function fire(d) {
    if (!enabled(d)) {
      return;
    }
    for (const input of d.inputs) {
      input.count--;
    }
    for (const output of d.outputs) {
      output.count++;
    }
    events.next(d);
    update();
  }
});

function dragstarted(d) {
  if (!d3.event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) {
    simulation.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
}

});
