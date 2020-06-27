// import fs from 'fs';
import gulp from 'gulp';
import del from 'del';
import server from 'browser-sync';
import gulpZip from 'gulp-zip';
import include from 'gulp-include';
import concat from 'gulp-concat';
import pathNpm from 'path';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import imgCompress from 'imagemin-jpeg-recompress';
import webpHTML from 'gulp-webp-html';
import svgSprite from 'gulp-svg-sprite';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import otf2woff from 'gulp-fonter';
import css from './gulp/css.js';
import path from './gulp/path.js';
import sourcemaps from 'gulp-sourcemaps';


const root = pathNpm.resolve();
// const name = pathNpm.basename(root);

// const buildFolder = name;
const buildFolder = 'build';
const sourceFolder = 'source';

const copy = () => gulp.src([
    path.src.img,
    path.src.fonts,
    path.src.pp,
    path.src.scss,
  ], {
    base: 'source',
  })
  .pipe(gulp.dest(buildFolder));



// export const clean = () => del(['build', name]);
export const clean = () => del('build');

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
  .pipe(gulpZip(`${root}.zip`))
  .pipe(gulp.dest(path.zipFolder));

const copyFonts = () => gulp.src(path.src.fonts)
  .pipe(gulp.dest(path.build.fonts));

const js = () => {
  gulp.src(path.src.jsVendors)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(path.build.js));
  return gulp.src(path.src.jsModules)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
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

const serverInit = () => {
  server.init({
    server: {
      baseDir: 'build/',
      online: true,
      tunnel: true,
    },
  });
}

const refresh = (done) => {
  server.reload();
  done();
};

export const watch = () => {
  gulp.watch(path.watch.html, gulp.series(html, refresh));
  gulp.watch(path.watch.htmlTemplates, gulp.series(html, refresh));
  gulp.watch(path.watch.css, css);
  gulp.watch(path.watch.img, gulp.series(copy, refresh));
  gulp.watch(path.watch.js, gulp.series(js, refresh));
  gulp.watch(path.watch.fonts, gulp.series(copyFonts, refresh));
  serverInit();
};

export const start = gulp.series(build, watch);

gulp.task('css', () => css());
gulp.task('js', js);
gulp.task('copyFonts', copyFonts);
gulp.task('copy', () => copy());
gulp.task('watch', watch);
gulp.task('build', build);
gulp.task('zip', zip);
gulp.task('images', images);
gulp.task('svgSprite', svgCreateSprite);
gulp.task('webp', webpOpt);
gulp.task('html', html);
gulp.task('fonts', fonts);
