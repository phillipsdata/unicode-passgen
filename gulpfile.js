var gulp = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  //watchify = require('watchify'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  buildDir = './dist',
  buildFile = 'app.js',
  buildMinFile = 'app.min.js',
  //testDir = './test',
  srcFile = './index.js';

// Bundle the file
gulp.task('browserify', function() {
  var options = {
    cache: {},
    packageCache: {},
    fullPaths: false,
    standalone: 'password-generator'
  };

  // Build the file and minified file
  return browserify(srcFile, options)
    .bundle()
    .pipe(source(buildFile))
    .pipe(gulp.dest(buildDir))
    .pipe(rename(buildMinFile))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(buildDir));
});

/*
// Watch files for changes
gulp.task('watch', function() {
  var watch = watchify(srcFile);
  watch.on('update', rebuild);

  function rebuild() {
    return watch
      .bundle()
      .pipe(source(buildFile))
      .pipe(gulp.dest(buildDir))
      .pipe(rename(buildMinFile))
      .pipe(uglify())
      .pipe(gulp.dest(buildDir));
  }

  return rebuild();
});
*/
gulp.task('build', ['browserify']);