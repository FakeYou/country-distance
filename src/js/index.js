'use strict';

var d3       = require('d3');
var topojson = require('topojson');

var width  = 960;
var height = 640;

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

d3.json('./assets/countries/countries.geo.json', function(err, countries) {
  if(err) { 
    return console.error(err);
  }

  console.log(countries);

  svg.append('path')
    .datum(topojson.feature(countries, countries.features[131]))
    .attr('d', d3.geo.path().projection(d3.geo.mercator()));
});