'use strict';

var _           = require('underscore');
var del         = require('del');
var gulp        = require('gulp');
var connect     = require('gulp-connect');
var browserify  = require('gulp-browserify');
var jsoncombine = require('gulp-jsoncombine');
var plumber     = require('gulp-plumber');
var ignore      = require('gulp-ignore');
var run         = require('gulp-run');
var map         = require('vinyl-map');

gulp.task('webserver', function() {
  connect.server({
    root: './build',
    livereload: true
  });
});

gulp.task('browserify', function() {
  gulp.src('./src/js/index.js')
    .pipe(plumber())
    .pipe(browserify())
    .pipe(gulp.dest('./build/js'))
    .pipe(connect.reload());
});

gulp.task('copy', function() {
  gulp.src('./src/**/*')
    .pipe(plumber())
    .pipe(ignore.exclude('./src/js/*'))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch('./src/js/*', ['browserify']);
  gulp.watch('./src/**/*', ['copy']);
});

gulp.task('build:map', ['verify:ogr2ogr', 'verify:topojson'], function() {
  del('./build/assets/world/*.json');

  gulp.src('.')
    .pipe(plumber())
    .pipe(run([
      'ogr2ogr',
      '-f GeoJSON',
      '-where "adm0_a3 != \'ATA\'"',
      './build/assets/world/countries.json',
      './assets/world/shapefiles/ne_110m/ne_110m_admin_0_countries.shp',

      '&&',
      
      'topojson',
      '-o ./build/assets/world/world.json',
      '--properties name=name',
      '--properties cca3=adm0_a3',
      './build/assets/world/countries.json'
    ].join(' ')));

  gulp.src(['build/assets/world/world.json', './assets/world/countries.json'])
    .pipe(jsoncombine('data.json', function(data) {
      var geometries = data.world.objects.countries.geometries;
      var countries = data.countries;

      geometries = _.map(geometries, function(geometry) {
        var country = _.findWhere(countries, { 'cca3': geometry.properties.cca3 });

        if(country) {
          geometry.properties.borders = country.borders;
        }
        else {
          geometry.properties.borders = [];
        }

        if(geometry.properties.cca3 === 'SAH') {
          geometry.properties.borders = ['DZA', 'MRT', 'MAR'];
        }

        return geometry;
      });

      return new Buffer(JSON.stringify(data.world));
    }))
    .pipe(gulp.dest('./build/assets/world'));
});

gulp.task('verify:ogr2ogr', function() {
  gulp.src('.')
    .pipe(plumber())
    .pipe(run('which ogr2ogr', { verbosity: 0 }))
    .pipe(map(function(contents) {
      if(contents.toString().length === 0) {
        throw new Error('ogr2ogr not found in path, install gdal.');
      }
    }));
});

gulp.task('verify:topojson', function() {
  gulp.src('.')
    .pipe(plumber())
    .pipe(run('which topojson', { verbosity: 0 }))
    .pipe(map(function(contents) {
      if(contents.toString().length === 0) {
        throw new Error('topojson not found in path, install topojson.');
      }
    }));
});

gulp.task('build', ['browserify', 'copy', 'build:map']);
gulp.task('default', ['build', 'webserver', 'watch']);