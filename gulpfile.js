var gulp = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  name = 'unicode-passgen',
  buildDir = './dist',
  buildFile = name + '.js',
  buildMinFile = name + '.min.js',
  srcFile = './index.js';

// Bundle the file
gulp.task('browserify', function() {
  var options = {
    cache: {},
    packageCache: {},
    fullPaths: false
  };

  // Build the file and minified file
  return browserify(srcFile, options)
    .require(srcFile, { expose: name})
    .bundle()
    .pipe(source(buildFile))
    .pipe(gulp.dest(buildDir))
    .pipe(rename(buildMinFile))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(buildDir));
});

gulp.task('build', ['browserify']);
