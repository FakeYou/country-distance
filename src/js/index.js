'use strict';

var _        = require('underscore');
var d3       = require('d3');
var topojson = require('topojson');

var width  = 960;
var height = 640;

var projection = d3.geo.mercator()
    .translate([width / 2, height / 2])
    .scale((width - 1) / 2 / Math.PI);

var path = d3.geo.path()
    .projection(projection);

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// var scale = d3.scale.category20();

var scale = d3.scale.linear()
  .domain(Array.apply(null, {length: 29}).map(Number.call, Number))
  .range([
    '#ccece6',
    '#99d8c9',
    '#66c2a4',
    '#41ae76',
    '#238b45',
    '#006d2c',
    '#00441b',
    '#d4b9da',
    '#c994c7',
    '#df65b0',
    '#e7298a',
    '#ce1256',
    '#980043',
    '#67001f',
    '#fdd49e',
    '#fdbb84',
    '#fc8d59',
    '#ef6548',
    '#d7301f',
    '#b30000',
    '#7f0000',
    '#d0d1e6',
    '#a6bddb',
    '#74a9cf',
    '#3690c0',
    '#0570b0',
    '#045a8d',
    '#023858',
  ]);

console.log(scale(0),scale(10),scale(20));

var g = svg.append('g');

var setNeighborDistance = function(element, distance) {
  element.setAttribute('data-distance', distance);
  element.setAttribute('fill', scale(distance));
  element.setAttribute('stroke', scale(distance));

  var neighbors = _.compact(element.getAttribute('data-borders').split(','));

  _.each(neighbors, function(neighbor) {
    var neighborElement = document.querySelector('.country[data-cca3=' + neighbor +']');

    if(neighborElement === null) {
      return;
    }

    var neighborDistance = parseInt(neighborElement.getAttribute('data-distance'));

    if(!neighborDistance || distance + 1 < neighborDistance) {
      setNeighborDistance(neighborElement, distance + 1);
    }
  });
};

d3.json('./assets/world/data.json', function(err, world) {
  if(err) { 
    return console.error(err);
  }

  var countries = topojson.feature(world, world.objects.countries);

  g.selectAll('.country')
    .data(countries.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('data-cca3', function(d) { return d.properties.cca3; })
    .attr('data-name', function(d) { return d.properties.name; })
    .attr('data-borders', function(d) { return d.properties.borders.join(','); })
    .attr('d', path)
    .on('mouseover', function(e) {
      var elements = document.querySelectorAll('.country');
      _.invoke(elements, 'removeAttribute', 'data-distance');
      _.invoke(elements, 'removeAttribute', 'fill');
      _.invoke(elements, 'setAttribute', 'stroke', '#fff');

      setNeighborDistance(this, 1);

      console.log('-----', e.properties.name, e.properties.cca3);
      var max = 0;
      _.each(elements, function(element) {
        var distance = parseInt(element.getAttribute('data-distance'));
        if(distance > max) {
          max = distance;
          console.log(element.getAttribute('data-name'), distance);
        }
      });
      console.log('');
    });
});