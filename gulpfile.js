'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

function bundle(bundler) {
  return bundler
    .transform('babelify',{presets: ['env', 'react']})
    .bundle()
    .on('error', function(e) {
      gutil.log(e);
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/js'));
}

gulp.task('js', function() {
  return bundle(browserify('./javascript/index.js'));
});

gulp.task('sass', function() {
  return gulp.src('./sass/style.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function() {
  var watcher = watchify(browserify('./javascript/index.js', watchify.args));

  bundle(watcher);

  watcher.on('update', function() {
    bundle(watcher);
  });

  watcher.on('log', gutil.log);

  gulp.watch('./sass/**/*.scss', ['sass']);
});
