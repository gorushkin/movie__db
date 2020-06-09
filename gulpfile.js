const fs = require('fs');
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const cssNano = require('cssnano');
const server = require('browser-sync');
const autoprefixer = require('autoprefixer');
const gulpZip = require('gulp-zip');
const include = require('gulp-include');
const concat = require('gulp-concat');
const pathNpm = require('path');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const imgCompress = require('imagemin-jpeg-recompress');
const webpHTML = require('gulp-webp-html');
const webpcss = require('gulp-webpcss');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const otf2woff = require('gulp-fonter');

const name = pathNpm.basename(__dirname);

// const buildFolder = name;
const buildFolder = 'build';
const sourceFolder = 'source';

const path = {
  build: {
    css: `${buildFolder}/css`,
    scss: `${buildFolder}/scss`,
    img: `${buildFolder}/img`,
    js: `${buildFolder}/js`,
    fonts: `${buildFolder}/fonts/`,
  },
  src: {
    css: 'source/sass/style.scss',
    img: 'source/img/**',
    imgOpt: 'source/img',
    fonts: 'source/fonts/**',
    scss: 'source/sass/**/*.*',
    imgsrc: 'source/img - src/**/*.{png,jpg,svg}',
    svgsrc: 'source/img/**/*.svg',
    pp: 'source/pp/**',
    jsModules: 'source/js/modules/*.js',
    jsVendors: 'source/js/vendor/*.js',
    html: 'source/*.html',
  },
  watch: {
    html: 'source/*.html',
    htmlTemplates: 'source/templates/*.html',
    css: 'source/sass/**/*.{scss,sass}',
    js: 'source/js/**/*.*',
    img: 'source/img/**',
    fonts: 'source/fonts/**',
  },
  convert: {
    fontsIn: 'source/fonts — src/**',
    fontsInOtf: 'source/fonts — src/*.otf',
    fontsOutOtf: 'source/fonts — src/',
    fontsOut: 'source/fonts/',
  },
  zipFolder: 'C:/Users/Alex/Documents/artyom/webdev/залить',
};

// const processpres = [
//   autoprefixer,
//   cssNano,
// ];

const css = () => gulp.src(path.src.css)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
    includePaths: [`${__dirname}/node_modules`],
  }))
  .pipe(postcss([autoprefixer()]))
  .pipe(webpcss())
  .pipe(gulp.dest(path.build.css))
  .pipe(rename({
    extname: '.min.css'
  }))
  .pipe(postcss([cssNano()]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(path.build.css))
  .pipe(server.stream());

const copy = () => gulp.src([
    path.src.img,
    path.src.fonts,
    path.src.pp,
    path.src.scss,
  ], {
    base: 'source',
  })
  .pipe(gulp.dest(buildFolder));

const refresh = (done) => {
  server.reload();
  done();
};

const clean = () => del(['build', name]);

const images = () => gulp.src(path.src.imgsrc)
  .pipe(imagemin([
    imgCompress({
      loops: 4,
      min: 70,
      max: 80,
      quality: 'high',
    }),
    imagemin.optipng({
      optimizationLevel: 3,
    }),
    imagemin.svgo(),
  ]))
  .pipe(gulp.dest(path.build.img));

const webpOpt = () => gulp.src(path.src.imgsrc)
  .pipe(webp({
    quality: 70,
  }))
  .pipe(gulp.dest(path.src.imgOpt));

const svgCreateSprite = () => gulp.src(path.src.svgsrc)
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../icons.icons.svg',
        example: true
      }
    },
  }))
  .pipe(gulp.dest(path.src.imgOpt));

const zip = () => gulp.src('build/**')
  .pipe(gulpZip(`${name}.zip`))
  .pipe(gulp.dest(path.zipFolder));

const copyFonts = () => gulp.src(path.src.fonts)
  .pipe(gulp.dest(path.build.fonts));

const js = () => {
  gulp.src(path.src.jsVendors)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(path.build.js));
  return gulp.src(path.src.jsModules)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(path.build.js));
}

const html = () => gulp.src(path.src.html)
  .pipe(include())
  // .pipe(webpHTML())
  .pipe(gulp.dest(buildFolder));

const fonts = () => {
  gulp.src(path.convert.fontsInOtf)
    .pipe(otf2woff({
      formats: ['ttf']
    }))
    .pipe(gulp.dest(path.convert.fontsOutOtf));
  gulp.src(path.convert.fontsIn)
    .pipe(ttf2woff())
    .pipe(gulp.dest(path.convert.fontsOut));
  return gulp.src(path.convert.fontsIn)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.convert.fontsOut));
}

// const otf2waff = () => gulp.src([`source/fonts/*.otf`])
//   .pipe(otf2woff({
//     formats: ['woff', 'ttf']
//   }))
//   .pipe(gulp.dest(path.convert.fonts));

const build = gulp.series(clean, gulp.parallel(js, css, copy, html));

const watch = () => {
  server.init({
    server: {
      baseDir: 'build/',
    },
  });
  gulp.watch(path.watch.html, gulp.series(html, refresh));
  gulp.watch(path.watch.htmlTemplates, gulp.series(html, refresh));
  gulp.watch(path.watch.css, css);
  gulp.watch(path.watch.img, gulp.series(copy, refresh));
  gulp.watch(path.watch.js, gulp.series(js, refresh));
  gulp.watch(path.watch.fonts, gulp.series(copyFonts, refresh));
};

const start = gulp.series(build, watch);

gulp.task('css', () => css());
gulp.task('js', js);
gulp.task('copyFonts', copyFonts);
gulp.task('clean', () => clean());
gulp.task('copy', () => copy());
gulp.task('watch', watch);
gulp.task('build', build);
gulp.task('start', start);
gulp.task('zip', zip);
gulp.task('images', images);
gulp.task('svgSprite', svgCreateSprite);
gulp.task('webp', webpOpt);
gulp.task('html', html);
gulp.task('fonts', fonts);
