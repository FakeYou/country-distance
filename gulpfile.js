'use strict';

var gulp       = require('gulp');
var connect    = require('gulp-connect');
var browserify = require('gulp-browserify');
var plumber    = require('gulp-plumber');
var ignore     = require('gulp-ignore');

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

gulp.task('assets', function() {
  gulp.src('./assets/**/*', { base: '.' })
    .pipe(plumber())
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch('./src/js/*', ['browserify']);
  gulp.watch('./src/**/*', ['copy']);
});

gulp.task('build', ['browserify', 'copy', 'assets']);
gulp.task('default', ['build', 'webserver', 'watch']);