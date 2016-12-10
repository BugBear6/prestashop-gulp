var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    compass = require('gulp-compass'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    cache = require('gulp-cached'),
    concat = require('gulp-concat'),
    pump = require('pump'),
    gutil = require( 'gulp-util' ),
    ftp = require( 'vinyl-ftp' ),
    changed = require('gulp-changed');



var paths = {
    scripts: ['./javascript/**/**/*.js'],
    sass: './sass/**/**/*.scss',
    tpl: './**/**/*.tpl',
    css: './css/**/**/*.css'
};

// Dest folder to ftp deployment 
var dest_path = '/web';


gulp.task('serve', ['sass', 'js'], function() {
    browserSync.init({
        proxy: "localhost"
    });
    gulp.watch(paths.sass, ['sass']);

    // use this line to watch only css files
    //gulp.watch(paths.css).on('change', browserSync.reload); 
    gulp.watch(paths.scripts, ['js-watch']);
    gulp.watch(paths.tpl).on('change', browserSync.reload);
});


gulp.task('js', function(cb) {
    pump([
            gulp.src(paths.scripts),
            sourcemaps.init(),
            cache('linting'),
            //concat('all.min.js'),
            uglify(),
            sourcemaps.write(),
            gulp.dest('./js')
        ],
        cb
    );
});


gulp.task('js-watch', ['js'], function(done) {
    browserSync.reload();
    done();
});


gulp.task('sass', function() {
    gulp.src('./sass/{,*/}*.{scss,sass}')
        .pipe(sourcemaps.init())
        .pipe(compass({
            config_file: './config.rb',
            css: './css',
            sass: './sass'
        }))
        .pipe(sass({
            errLogToConsole: true,
            sourcemap: true
        }))
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: './sass/'
        }))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());
});


gulp.task('deploy', function () {
    
    var conn = ftp.create({
        host: '',
        user: '',
        password: '',
        parallel: 10,
        log:      gutil.log
    });
 
    var globs = [
        'css/*',
    ];

    // using base = '.' will transfer everything to /public_html correctly 
    // turn off buffering in gulp.src for best performance 
 
    return gulp.src(globs, { base: '.', buffer: false })
        //.pipe( conn.newer( '/' ) ) // only upload newer files 
        .pipe(conn.dest(dest_path));
});


gulp.task('default', ['serve']);