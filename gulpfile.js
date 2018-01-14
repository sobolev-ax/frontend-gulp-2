'use strict'

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  cssmin = require('gulp-clean-css'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rimraf = require('rimraf'),
  browserSync = require("browser-sync"),
  jade = require('gulp-jade'),
  gutil = require('gulp-util'),
  upmodul = require("gulp-update-modul"),
  babel = require('gulp-babel'),
  reload = browserSync.reload;
 

// Так же создадим js объект в который пропишем все нужные нам пути,
// чтобы при необходимости легко в одном месте их редактировать:

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    jade: 'build/',
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/',
    json: 'build/json/'
  },
  src: { //Пути откуда брать исходники
    jade: 'src/*.jade', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    jsUglify: 'src/js/mainUglify.js',//В стилях и скриптах нам понадобятся только main файлы
    js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
    style: 'src/style/main.scss',
    img: [ 'src/images/*.*', 'src/images/photorama/*.*' ], //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/*.*',
    json: 'src/json/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    jade: ['src/*.jade', 'src/template/*.jade'],
    html: 'src/template/*.html',
    js: ['src/js/*.js', 'src/js/partials/*.js'],
    style: ['src/style/*.*', 'src/style/partials/*.*'],
    img: [ 'src/images/*.*', 'src/images/photorama/*.*' ],
    fonts: 'src/fonts/*.*',
    json: 'src/json/*.*'
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: "./build",
    directory: true
  },
  reloadDebounce: 700,
  //tunnel: true,
  host: 'localhost',
  port: 9000
};
gulp.task('webserver', function () {
  browserSync(config);
});


/*gulp.task('html:build', function () {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});*/
gulp.task('jade:build', function(){
  gulp.src(path.src.jade)
    .pipe(jade( {pretty: true} ).on('error', gutil.log) .on('error', gutil.beep))
    .pipe(gulp.dest(path.build.jade))
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


gulp.task('js:build', function () {
  gulp.src(path.src.jsUglify) //Найдем наш main файл
    .pipe(rigger()) //Прогоним через rigger
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.build.js)); //Выплюнем готовый файл в build
  gulp.src(path.src.js) //Найдем наш main файл
    .pipe(rigger()) //Прогоним через rigger
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
    .pipe(reload({stream: true})); //И перезагрузим сервер
});


gulp.task('style:build', function () {
  gulp.src(path.src.style) //Выберем наш main.scss
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(sass().on('error', gutil.log) .on('error', gutil.beep)) //Скомпилируем
    .pipe(prefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) //И в build
    .pipe(reload({stream: true}));
});
gulp.task('image:build', function () {
  gulp.src(path.src.img) //Выберем наши картинки
    // .pipe(imagemin({ //Сожмем их
    //   progressive: true,
    //   svgoPlugins: [{removeViewBox: false}],
    //   use: [pngquant()],
    //   interlaced: true
    // }))
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(reload({stream: true}));
});
gulp.task('json:build', function () {
  gulp.src(path.src.json)
    .pipe(gulp.dest(path.build.json))
    .pipe(reload({stream: true}));
});
gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});
gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});


gulp.task('watch', function(){
  watch(path.watch.jade, function(event, cb) {
   gulp.start('jade:build');
  });
  watch(path.watch.style, function(event, cb) {
    gulp.start('style:build');
  });
  watch(path.watch.js, function(event, cb) {
    gulp.start('js:build');
  });
  watch(path.watch.img, function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.json], function(event, cb) {
    gulp.start('json:build');
  });
});
gulp.task('build', [
  /*'html:build',*/
  'jade:build',
  'json:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build'
]);
gulp.task('update-modul', function () {
    gulp.src('package.json')
    .pipe(upmodul('latest', 'false')); //update all modules latest version. 
});
gulp.task('default', ['build', 'webserver', 'watch']);