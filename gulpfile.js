var gulp = require('gulp');
var jest = require('gulp-jest-iojs');
var notify = require('gulp-notify');

gulp.task('watch', ['jest'], function() {
  gulp.watch(['**/*.js'], ['jest']);
});

gulp.task('jest', function () {
  return gulp.src('__tests__').pipe(jest({
    scriptPreprocessor: "../node_modules/babel-jest",
    unmockedModulePathPatterns: [
      //"node_modules/react",
      "node_modules"
    ],
    testPathIgnorePatterns: [
      "node_modules",
      "spec/support"
    ],
    testFileExtensions: [
      "es6",
      "js"
    ],
    moduleFileExtensions: [
      "js",
      "json",
      "es6"
    ]
  })).on('error', function() {
    var args = Array.prototype.slice.call(arguments);

    // Send error to notification center with gulp-notify
    notify.onError({
      title: "Compile Error",
      message: "<%= error %>"
    }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');
  });
});
