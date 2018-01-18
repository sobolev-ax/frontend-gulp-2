'use sctrict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const cssmin = require('gulp-clean-css');
// const imagemin = require('gulp-imagemin');
// const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const browserSync = require('browser-sync');
const jade = require('gulp-jade');
const gutil = require('gulp-util');
const upmodul = require('gulp-update-modul');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

const restart = browserSync.reload;

// Так же создадим js объект в который пропишем все нужные нам пути,
// чтобы при необходимости легко в одном месте их редактировать:

const path = {
  build: {
    jade: 'build/',
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/',
    json: 'build/json/',
  },
  src: { /* Пути откуда брать исходники */
    jade: 'src/*.jade', /* Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html */
    html: 'src/*.html', /* Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html */
    jsUglify: 'src/js/mainUglify.js', /* В стилях и скриптах нам понадобятся только main файлы */
    js: 'src/js/main.js', /* В стилях и скриптах нам понадобятся только main файлы */
    style: 'src/style/main.scss',
    img: ['src/images/*.*', 'src/images/photorama/*.*'], /* означает - взять все файлы всех расширений из папки и из вложенных каталогов */
    fonts: 'src/fonts/*.*',
    json: 'src/json/*.*',
  },
  watch: { /* Тут мы укажем, за изменением каких файлов мы хотим наблюдать */
    jade: ['src/*.jade', 'src/template/*.jade'],
    html: 'src/template/*.html',
    js: ['src/js/*.js', 'src/js/partials/*.js'],
    style: ['src/style/*.*', 'src/style/partials/*.*'],
    img: ['src/images/*.*', 'src/images/photorama/*.*'],
    fonts: 'src/fonts/*.*',
    json: 'src/json/*.*',
  },
  clean: './build',
};

const config = {
  server: {
    baseDir: './build',
    directory: true,
  },
  reloadDebounce: 700,
  /* tunnel: true, */
  host: 'localhost',
  port: 9000,
};
gulp.task('webserver', () => {
  browserSync(config);
});

/* gulp.task('webserver', function webserver() {
  browserSync(config);
}); */
/* gulp.task('html:build', function () {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(restart({stream: true})); //И перезагрузим наш сервер для обновлений
}); */

gulp.task('jade:build', () => {
  gulp.src(path.src.jade)
    .pipe(jade({ pretty: true }).on('error', gutil.log).on('error', gutil.beep))
    .pipe(gulp.dest(path.build.jade))
    .pipe(restart({ stream: true })); /* И перезагрузим наш сервер для обновлений */
});


gulp.task('js:build', () => {
  gulp.src(path.src.jsUglify) /* Найдем наш main файл */
    .pipe(rigger()) /* Прогоним через rigger */
    .pipe(sourcemaps.init()) /* Инициализируем sourcemap */
    .pipe(uglify()) /* Сожмем наш js */
    .pipe(sourcemaps.write()) /* Пропишем карты */
    .pipe(gulp.dest(path.build.js)); /* Выплюнем готовый файл в build */
  gulp.src([path.src.js, '!node_modules/**']) /* Найдем наш main файл */
    .pipe(rigger()) /* Прогоним через rigger */
    .pipe(eslint().on('error', gutil.log))
    .pipe(babel({
      presets: ['env'],
    }).on('error', gutil.log))
    .pipe(gulp.dest(path.build.js)) /* Выплюнем готовый файл в build */
    .pipe(restart({ stream: true })); /* И перезагрузим сервер */
});


gulp.task('style:build', () => {
  gulp.src(path.src.style) /* Выберем наш main.scss */
    .pipe(sourcemaps.init()) /* То же самое что и с js */
    .pipe(sass().on('error', gutil.log).on('error', gutil.beep)) /* Скомпилируем */
    .pipe(prefixer()) /* Добавим вендорные префиксы */
    .pipe(cssmin()) /* Сожмем */
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) /* И в build */
    .pipe(restart({ stream: true }));
});
gulp.task('image:build', () => {
  gulp.src(path.src.img) /* Выберем наши картинки */
    .pipe(gulp.dest(path.build.img)) /* И бросим в build */
    .pipe(restart({ stream: true }));
});
gulp.task('json:build', () => {
  gulp.src(path.src.json)
    .pipe(gulp.dest(path.build.json))
    .pipe(restart({ stream: true }));
});
gulp.task('clean', (cb) => {
  rimraf(path.clean, cb);
});
gulp.task('fonts:build', () => {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
});


gulp.task('watch', () => {
  watch(path.watch.jade, () => {
    gulp.start('jade:build');
  });
  watch(path.watch.style, () => {
    gulp.start('style:build');
  });
  watch(path.watch.js, () => {
    gulp.start('js:build');
  });
  watch(path.watch.img, () => {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], () => {
    gulp.start('fonts:build');
  });
  watch([path.watch.json], () => {
    gulp.start('json:build');
  });
});
gulp.task('build', [
  'jade:build',
  'json:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build',
]);
gulp.task('update-modul', () => {
  gulp.src('package.json')
    .pipe(upmodul('latest', 'false'));
});

gulp.task('default', ['build', 'webserver', 'watch']);
