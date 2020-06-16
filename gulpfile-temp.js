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
const include = require('gulp-include');
const concat = require('gulp-concat');

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
};