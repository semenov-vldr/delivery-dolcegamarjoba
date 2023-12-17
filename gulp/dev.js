const gulp = require('gulp');

const gulpPug = require('gulp-pug');
const sass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob');
const server = require('gulp-server-livereload');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const fs = require('fs'); // File System
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const concatJs = require('gulp-concat');
const concatCss = require('gulp-concat-css');

const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');


// ---- Tasks ----

// Clean
gulp.task('clean:dev', function (done) {
  if (fs.existsSync('./build/')) {
    return gulp
      .src('./build/', {read: false})
      .pipe(clean());
  }
  done();
});

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false,
    })
  };
};

// Pug
gulp.task("pug:dev", function () {
  return gulp
    .src("./src/pages/**/*.pug")
    .pipe(changed("./build/", { hasChanged: changed.compareContents }))
    .pipe(plumber(plumberNotify("Error HTML")))
    .pipe(gulpPug({}))
    .pipe(gulp.dest("./build/"))
    .pipe(browserSync.reload({
      stream: true,
    }));
});

// Sass
gulp.task("sass:dev", function () { // Добавить autoprefixer, csso
  return gulp
    .src("./src/sass/main.sass")
    .pipe(changed("./build/css/"))
    .pipe(plumber(plumberNotify("Error Sass")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(concatCss("main.css"))
    .pipe(gulp.dest("./build/assets/css/"))
    .pipe(browserSync.reload({
        stream: true,
      }));
});

// Styles Libs
gulp.task("style:libs:dev", function () {
  return gulp
    .src("./src/libs/**/*.css")
    .pipe(concatCss("libs.min.css"))
    .pipe(gulp.dest("./build/assets/css/"))
    .pipe(browserSync.reload({
    stream: true,
  }));
});


// Images
gulp.task("images:dev", function () {
  return gulp
    .src("./src/img/**/*.{png,svg,jpg,jpeg,gif,webp}")
    .pipe(changed("./build/img/"))
    .pipe(imagemin({ verbose: true } ))
    .pipe(gulp.dest("./build/assets/img/"))
});

// fonts
gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/assets/fonts/"))
});

// Files
gulp.task("files:dev", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"))
});


// Scripts
gulp.task('scripts:dev', function () {
  return gulp
    .src([
      './src/scripts/**/*.js',
      './src/blocks/**/*.js'
    ])
    .pipe(changed("./build/scripts/"))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(babel())
    .pipe(concatJs("main.js"))
    .pipe(gulp.dest('./build/assets/scripts/'))
    .pipe(browserSync.reload({
        stream: true,
      }));
});

// Libs JS
gulp.task('libs:dev', function () {
  return gulp
    .src('./src/libs/**/*.js')
    .pipe(concatJs('libs.min.js'))
    .pipe(gulp.dest('./build/assets/scripts/'))
})

// Browser-Sync
gulp.task("browser-sync:dev", function () {
  browserSync.init({
    server: "./build",
    https: false,
    open: true,
  });
});


// watcher
gulp.task("watch:dev", function () {
  gulp.watch(['./src/sass/**/*.sass', './src/blocks/**/*.sass'], gulp.parallel('sass:dev'));
  gulp.watch('./src/**/*.pug', gulp.parallel('pug:dev'));
  gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
  gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
  gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
  gulp.watch(['./src/scripts/**/*.js', './src/blocks/**/*.js'], gulp.parallel('scripts:dev'));
});
