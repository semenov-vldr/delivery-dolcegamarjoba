"use strict";

const gulp = require('gulp');

// Tasks
require('./gulp/dev.js');




// default (dev)
// gulp.task('default', gulp.series(
//   'clean:dev',
//   gulp.parallel('pug:dev', 'sass:dev', 'images:dev', 'fonts:dev', 'files:dev', 'libs:dev', 'scripts:dev'),
//   gulp.parallel('browser-sync:dev','watch:dev')
// ));

gulp.task('build', gulp.series(
  'clean:dev',
  gulp.parallel('pug:dev', 'sass:dev', 'images:dev', 'fonts:dev', 'files:dev', 'libs:dev', 'scripts:dev'),
));

gulp.task("default",
  gulp.series(gulp.parallel('browser-sync:dev','watch:dev')));
