var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// -----------------------------
// BrowserSync başlat
// -----------------------------
function serve(done) {
  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html'
    },
    notify: false,
    open: true,
  });
  done();
}

// -----------------------------
// Dosyaları izle
// -----------------------------
function watchFiles() {
  gulp.watch('js/**/*.js').on('change', browserSync.reload);
  gulp.watch('css/**/*.css').on('change', browserSync.reload);
  gulp.watch('**/*.html').on('change', browserSync.reload);
}

// -----------------------------
// Dev Task (sadece izleme ve live reload)
var dev = gulp.series(
  serve,
  watchFiles
);

// -----------------------------
// Build Task (istersen minify ve SCSS dahil burada yapabilirsin)
function compileSass() {
  var sass = require('gulp-sass')(require('sass'));
  var header = require('gulp-header');
  var pkg = require('./package.json');
  var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
  ].join('');

  return gulp.src('scss/**/*.scss', { sourcemaps: true })
    .pipe(sass({ quietDeps: true }).on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css', { sourcemaps: '.' }));
}

function minifyCss() {
  var cleanCSS = require('gulp-clean-css');
  var rename = require('gulp-rename');
  return gulp.src('css/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'));
}

function minifyJs() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');
  var header = require('gulp-header');
  var pkg = require('./package.json');
  var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
  ].join('');

  return gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'));
}

// Build task (opsiyonel)
var build = gulp.series(
  compileSass,
  gulp.parallel(minifyCss, minifyJs)
);

// -----------------------------
// Export
exports.dev = dev;
exports.build = build;
exports.sass = compileSass;
exports['minify-css'] = minifyCss;
exports['minify-js'] = minifyJs;
