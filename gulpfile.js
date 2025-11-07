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

// Compile SCSS
function compileSass() {
  return gulp.src('scss/resume.scss')
    .pipe(sass({ quietDeps: true }).on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify CSS
function minifyCss() {
  return gulp.src('css/resume.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify JS
function minifyJs() {
  return gulp.src('js/resume.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
}

// Copy vendor files
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

// BrowserSync
function serve(done) {
  browserSync.init({
    server: {
      baseDir: 'D:/xampp/htdocs/mycv',
      index: 'index.html'
    },
  });
  done();
}

// Watch files
function watchFiles() {
  gulp.watch('scss/**/*.scss', gulp.series(compileSass, minifyCss));
  gulp.watch('js/**/*.js', minifyJs);
  gulp.watch('*.html').on('change', browserSync.reload);
}

// Dev task
var dev = gulp.series(
  gulp.parallel(compileSass, minifyCss, minifyJs),
  serve,
  watchFiles
);

// Default task
var build = gulp.series(
  gulp.parallel(compileSass, minifyCss, minifyJs, copyVendors)
);

// Export tasks
exports.sass = compileSass;
exports['minify-css'] = minifyCss;
exports['minify-js'] = minifyJs;
exports.copy = copyVendors;
exports.dev = dev;
exports.default = build;
