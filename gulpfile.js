var htmlminify = require("gulp-html-minify");
var cssminify = require("gulp-clean-css");
var runsequence = require("run-sequence");
var revreplace = require("gulp-rev-replace");
var filter = require('gulp-filter');
var useref = require('gulp-useref');
var connect = require('gulp-connect');
// var base64 = require('gulp-base64');
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    srcPath = {
        HTML: "./src/*.html",
        LESS: "./src/less/*.less",
        CSS: "./src/css/*.css",
        JS: "./src/js/*.js",
        IMG: "./src/images",
    },
    distPath = {
        ROOT: "./dist",
        CSS: "./dist/css",
        JS: "./dist/js",
        IMG: "./dist/images"
    };

gulp.task('dev', function () {
    connect.server({
        name: 'connect dev',
        root: './src',
        // host: 'wl.v',
        prot: 8000,
        livereload: true //实时刷新
    })
});

gulp.task('pro', function () {
    connect.server({
        name: 'connect pro',
        root: './dist',
        prot: 8001,
        livereload: true //实时刷新
    })
});

gulp.task('auto-fx', function () {
    gulp.src(srcPath.CSS)
        .pipe($.autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest(distPath.CSS));
});
gulp.task('html', function () {
    gulp.src(srcPath.HTML)
    // .pipe(gulp.dest(distPath.ROOT))
        .pipe($.connect.reload());
})
gulp.task('less', function () {
    gulp.src(srcPath.LESS)
        .pipe($.less())
        .pipe($.base64())
        .pipe(gulp.dest('./src/css'))
        .pipe(gulp.dest(distPath.CSS))
        .pipe($.connect.reload());
});
gulp.task('js', function () {
    gulp.src(srcPath.HTML)
    // .pipe(gulp.dest(distPath.ROOT))
        .pipe($.connect.reload());
})
gulp.task('watch', function () {
    console.log("====== watching hec HTML files... =====");
    gulp.watch(srcPath.HTML, ['html']);

    console.log("====== watching hec LESS files... =====");
    gulp.watch(srcPath.LESS, ['less']);

    console.log("====== watching hec JS files... =====");
    gulp.watch(srcPath.JS, ['js']);
    // gulp.watch((srcPath.JS))

});

gulp.task('clean-dist', function () {
    return gulp.src('./dist', {read: false})
        .pipe($.clean());
});

// CSS 压缩支持自动生成前缀，这个配置可以百度，根据最终环境自定义
var CSS_AUTO_PREF = [
    'last 2 version', 'last 3 Chrome versions', 'Firefox >= 20', 'safari 5', 'ie 8', 'ie 9', 'ios >=7', 'android 4'
];

gulp.task('minify-css', function () {
    const f = $.filter(srcPath.CSS);
    gulp.src(srcPath.CSS)
        .pipe($.autoprefixer({
            browsers: CSS_AUTO_PREF,
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cssminify({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe($.rev())
});

gulp.task('minify-js', function () {
    const f = $.filter(srcPath.JS);
    return gulp.src(srcPath.JS)
        .pipe($.uglify())
        .pipe($.rev())

});

gulp.task("minify-html", ['img', 'minify-css', 'minify-js'], function () {
    // 读取前面保存的文件名映射关系
    const manifest = gulp.src([distPath.ROOT + '/rev-manifest.json']);
    // 进行替换
    return gulp.src(srcPath.HTML)
        .pipe(useref())
        .pipe(htmlminify())
        .pipe($.rev())
        .pipe(revreplace({replaceInExtensions: ['.html', '.css'], manifest: manifest}))
        .pipe(gulp.dest(distPath.ROOT))
        .pipe($.rev.manifest('./dist/rev-manifest.json',   //- 生成一个rev-manifest.json
            {
                base: distPath.ROOT,    //输出合并后的json文件的目录
                merge: true             // merge with the existing manifest if one exists))
            }))
        .pipe(gulp.dest(distPath.ROOT))
});
gulp.task('img', function () {
    const manifest = gulp.src([distPath.ROOT + '/rev-manifest.json']);
    return gulp.src(srcPath.IMG + '/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe($.rev())
        .pipe(revreplace({replaceInExtensions: ['.html'], manifest: manifest}))
        .pipe(gulp.dest(distPath.IMG))
        .pipe($.rev.manifest('./dist/rev-manifest.json',   //- 生成一个rev-manifest.json
            {
                base: distPath.ROOT,    //输出合并后的json文件的目录
                merge: true             // merge with the existing manifest if one exists))
            }))
        .pipe(gulp.dest(distPath.ROOT))
})
gulp.task('build', function () {
    // runsequence('clean-dist', 'minify-css', 'minify-html')
    gulp.run('minify-html');
});

gulp.task('default', ['dev', 'watch']);
// gulp.task('server', ['pro']);

