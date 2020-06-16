import gulp from 'gulp';
import path from './path.js';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import cssNano from 'cssnano';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import pathNpm from 'path';
import webpcss from 'gulp-webpcss';
import server from 'browser-sync';


const root = pathNpm.resolve();

export default () => gulp.src(path.src.css)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
    includePaths: [`${root}/node_modules`],
  }))
  .pipe(postcss([autoprefixer()]))
  .pipe(webpcss())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(path.build.css))
  .pipe(server.stream());

// const css = () => gulp.src(path.src.css)
//   .pipe(plumber())
//   .pipe(sourcemaps.init())
//   .pipe(sass({
//     outputStyle: 'expanded',
//     includePaths: [`${__dirname}/node_modules`],
//   }))
//   .pipe(postcss([autoprefixer()]))
//   .pipe(webpcss())
//   .pipe(gulp.dest(path.build.css))
//   .pipe(rename({
//     extname: '.min.css'
//   }))
//   .pipe(postcss([cssNano()]))
//   .pipe(sourcemaps.write('.'))
//   .pipe(gulp.dest(path.build.css))
//   .pipe(server.stream());