var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass')); // Dart Sass
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Banner
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// -----------------------------
// SCSS derleme
// -----------------------------
function compileSass() {
  return gulp.src('scss/**/*.scss', { sourcemaps: true })
    .pipe(sass({ quietDeps: true }).on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css', { sourcemaps: '.' }))
    .pipe(browserSync.stream());
}

// -----------------------------
// CSS minify
// -----------------------------
function minifyCss() {
  return gulp.src('css/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// -----------------------------
// JS minify
// -----------------------------
function minifyJs() {
  return gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({ stream: true }));
}

// -----------------------------
// Vendor copy (Bootstrap, jQuery, vs.)
// -----------------------------
function copyVendors() {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
    .pipe(gulp.dest('vendor/bootstrap'));

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'));

  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'));

  gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'));

  gulp.src([
      'node_modules/devicons/**/*',
      '!node_modules/devicons/*.json',
      '!node_modules/devicons/*.md'
    ])
    .pipe(gulp.dest('vendor/devicons'));

  gulp.src(['node_modules/simple-line-icons/**/*', '!node_modules/simple-line-icons/*.json', '!node_modules/simple-line-icons/*.md'])
    .pipe(gulp.dest('vendor/simple-line-icons'));

  return Promise.resolve();
}

// -----------------------------
// BrowserSync başlat
// -----------------------------
function serve(done) {
  browserSync.init({
    server: {
      baseDir: './',  // Proje kökü
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
  gulp.watch('scss/**/*.scss', gulp.series(compileSass, minifyCss));
  gulp.watch('js/**/*.js', gulp.series(minifyJs));
  gulp.watch('**/*.html').on('change', browserSync.reload); // Tüm alt dizinlerdeki HTML
  gulp.watch('css/**/*.css').on('change', browserSync.reload); // CSS değişimlerini izlemek için
}

// -----------------------------
// Dev Task
// -----------------------------
var dev = gulp.series(
  gulp.parallel(compileSass, minifyCss, minifyJs),
  serve,
  watchFiles
);

// -----------------------------
// Build Task
// -----------------------------
var build = gulp.series(
  gulp.parallel(compileSass, minifyCss, minifyJs, copyVendors)
);

// -----------------------------
// Export
// -----------------------------
exports.sass = compileSass;
exports['minify-css'] = minifyCss;
exports['minify-js'] = minifyJs;
exports.copy = copyVendors;
exports.dev = dev;
exports.default = build;
