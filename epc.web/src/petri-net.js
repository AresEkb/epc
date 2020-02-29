function isPnmlObject(obj, eClassName) {
  // return obj.eClass == 'http://org.pnml.tools/epnk/pnmlcoremodel#//' + eClassName;
  return obj.eClass == 'http:///ptnet.ecore#//' + eClassName;
}

function isPnObject(obj, eClassName) {
  return obj.eClass == 'http://org.pnml.tools/epnk/types/ptnet#//' + eClassName;
}

function isPlace(obj) {
  // TODO: Why different namespaces?
  return isPnmlObject(obj, 'Place') || isPnObject(obj, 'Place');
}

function isTransition(obj) {
  return isPnmlObject(obj, 'Transition');
}

function isArc(obj) {
  return isPnmlObject(obj, 'Arc');
}

document.addEventListener('DOMContentLoaded', () => {

  const svg = d3.select('#pn-diagram')
  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(20).strength(2.5))
    // .force('link', d3.forceLink().id(d => d.id).distance(20).strength(d => {
    //   // console.log(d);
    //   return d.source.y > d.target.y ? 0.5 : 2.5;
    // }))
    .force('charge', d3.forceManyBody().strength(-70))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX(width / 2).strength(0.15))
    // .force('y', d3.forceY(height / 2).strength(d => {
    //   console.log(d);
    //   return d.source.y > d.target.y ? 0 : 0.2;
    // }))

  d3.json('model.json').then(function (model) {

    const nodes = [];
    const links = [];

    for (const root of model) {
      if (isPnmlObject(root, 'PetriNetDoc')) {
        for (const obj of root.nets[0].pages[0].objects) {
          if (isPlace(obj)) {
            nodes.push({
              kind: 'place',
              id: obj.id,
              name: obj.name != null ? obj.name.text : '',
              inputs: [],
              outputs: [],
              // count: obj.initialMarking != null ? +obj.initialMarking.text.value : 0
              count: 0
            });
          }
          else if (isTransition(obj)) {
            nodes.push({
              kind: 'transition',
              id: obj.id,
              name: obj.name != null ? obj.name.text : '',
              inputs: [],
              outputs: []
            });
          }
          else if (isArc(obj)) {
            links.push({
              source: obj.source['$ref'],
              target: obj.target['$ref']
            });
          }
        }
      }
    }
    for (const link of links) {
      link.source = nodes.find(node => node.id == link.source);
      link.target = nodes.find(node => node.id == link.target);
      link.source.outputs.push(link.target);
      link.target.inputs.push(link.source);
    }

    const arc = svg.append('g')
      .attr('class', 'links')
      .selectAll('g')
      .data(links, d => d.id)
      .enter().append('g')
        .attr('class', 'arc')
        .append('line')
          .attr('marker-end', 'url(#arrow)');

    const place = svg.append('g')
      .attr('class', 'places')
      .selectAll('svg')
      .data(nodes.filter(d => d.kind == 'place'), d => d.id)
      .enter().append('svg')
        .attr('class', 'place')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', changeMarking);
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
      .data(nodes.filter(d => d.kind == 'transition'), d => d.id)
      .enter().append('svg')
        .attr('class', 'transition')
        .classed('enabled', enabled)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', fire)
        .on('mouseover', focusTransition)
        .on('mouseout', unfocusTransition);
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

    simulation.force('bounding-box', alpha => {
      const size = 10;
      for (const node of nodes) {
        node.x = Math.max(Math.min(node.x, width - size), size);
        node.y = Math.max(Math.min(node.y, height - size), size);
      }
    });

    // simulation.force('top-bottom', alpha => {
    //   const k = 16 * alpha;
    //   links.forEach(function(d, i) {
    //     d.source.y -= k;
    //     d.target.y += k;
    //   });
    // });

    // simulation.force('weak-bottom-up', alpha => {
    //   const k = 16 * alpha;
    //   links.forEach(function(d, i) {
    //     d.source.y -= k;
    //     d.target.y += k;
    //   });
    // });

    simulation.force('initial-final', alpha => {
      for (const node of nodes) {
        if (node.inputs && node.inputs.length == 0) {
          // node.y -= 55 * alpha;
          node.y = 20;
        }
        if (node.outputs && node.outputs.length == 0) {
          // node.y += 55 * alpha;
          node.y = height - 20;
        }
      }
    });

    simulation.force('collision', d3.forceCollide().radius(20));

    function update() {
      arc
        .attr('x1', d => d.source.x.toFixed(2))
        .attr('y1', d => d.source.y.toFixed(2))
        .attr('x2', d => d.target.x.toFixed(2))
        .attr('y2', d => d.target.y.toFixed(2));
      place
        .attr('x', d => d.x.toFixed(2) - 10)
        .attr('y', d => d.y.toFixed(2) - 10);
      transition
        .attr('x', d => d.x.toFixed(2) - 10)
        .attr('y', d => d.y.toFixed(2) - 10);
    }

    function updateMarking() {
      place.select('tspan').text(d => d.count);
      transition.classed('enabled', enabled);
    }

    function updateFocus() {
      transition.classed('focused', d => d.focused);
    }

    function focusTransition(d) {
      if (enabled(d)) {
        d.focused = true;
        raiseActiveEvent(d);
        updateFocus();
      }
    }

    function unfocusTransition(d) {
      d.focused = false;
      raiseInactiveEvent(d);
      updateFocus();
    }

    function changeMarking(d) {
      if (d3.event.altKey) {
        if (d.count > 0) {
          if (--d.count == 0) {
            raiseEndEvent(d);
          }
        }
      }
      else {
        if (++d.count == 1) {
          instanceId++;
          raiseStartEvent(d);
        }
      }
      updateMarking();
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
        if (--input.count == 0) {
          raiseEndEvent(input);
        }
      }
      raiseStartEvent(d);
      raiseEndEvent(d);
      for (const output of d.outputs) {
        if (++output.count == 1) {
          raiseStartEvent(output);
        }
      }
      updateMarking();
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

});
