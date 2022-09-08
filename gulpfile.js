import gulp from 'gulp';
import del from 'del';
import versionNumber from 'gulp-version-number';
import plumber from 'gulp-plumber';
import htmlmin from 'gulp-htmlmin';
import browsersync from 'browser-sync';
import sass from 'gulp-dart-sass';
import rename from 'gulp-rename';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import terser from 'gulp-terser';

const buildFolder = `./build`;
const sourceFolder = `./source`;

const path = {
    build: {
        images: `${buildFolder}/img/`,
        script: `${buildFolder}/js/`,
        css: `${buildFolder}/css/`,
        html: `${buildFolder}/`,
    },
    source: {
        fonts: `${sourceFolder}/fonts/*.{woff2,woff}`,
        images: `${sourceFolder}/img/**/*.{jpg,png,svg}`,
        script: `${sourceFolder}/js/script.js`,
        scss: `${sourceFolder}/sass/style.scss`,
        html: `${sourceFolder}/*.html`,
    },
    watch: {
        images: `${sourceFolder}/img/**/*.{jpg,png,svg}`,
        script: `${sourceFolder}/js/script.js`,
        scss: `${sourceFolder}/sass/**/*.scss`,
        html: `${sourceFolder}/**/*.html`,
    },
    clean: buildFolder,
    buildFolder: buildFolder,
    srcFolder: sourceFolder,
};

// Clean
const clean = () => {
    return del(path.clean);
};

// Copy
const copy = () => {
    return gulp.src(path.source.fonts, 
        { 
            base: 'source',
        })
        .pipe(gulp.dest(path.buildFolder))
};

// Images
const copyImages = () => {
    return gulp.src(path.source.images)
        .pipe(gulp.dest(path.build.images))
};

 // HTML
const html = () => {
    return gulp.src(path.source.html)
        .pipe(
            versionNumber({
                'value': '%D%T',
                'append': {
                    'key': '_v',
                    'cover': 0,
                    'to': [
                        'css',
                        'js'
                    ]
                },
                'output': {
                    'file': 'version.json'
                }
            })
        )
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browsersync.stream())
};

// Styles
const styles = () => {
    return gulp.src(path.source.scss, { sourcemaps: true })
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({
            outputStyle: "expanded",
        }))
        .pipe(postcss([
            autoprefixer(),
            csso()
        ]))
        .pipe(rename({
            extname: ".min.css",
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(browsersync.stream())
};

// Scripts
const scripts = () => {
    return gulp.src(path.source.script)
        .pipe(terser())
        .pipe(gulp.dest(path.build.script))
};

// Server
const server = () => {
    browsersync.init({
        server: {
            baseDir: path.build.html
        },
        notify: false,
        port: 3000,
    });
};

// Watcher
const watcher = () => {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.scss, styles);
    gulp.watch(path.watch.script, scripts);
    gulp.watch(path.watch.images, copyImages);
};

// Update UI
const mainTasks = gulp.parallel(
    html,
    styles,
    scripts,
);

// Build
export const build = gulp.series(
    clean,
    copy,
    copyImages,
    mainTasks,
);

// Default
export default gulp.series(
    clean,
    copy,
    copyImages,
    mainTasks,
    gulp.parallel(
        server,
        watcher,
    ),
);