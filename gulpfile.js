var gulp = require('gulp'),
	$ = require('gulp-load-plugins')();

var src = {
	coffee: ['src/**/*.coffee']
};

var dest = {
	js: './dist/'
}

gulp.task('cafe', function () {

	return gulp.src(src.coffee)
		.pipe($.coffee({bare: true, sourceMap: false, sourceDest: dest.js }))
		.pipe(gulp.dest(dest.js));
});

gulp.task('watch', function () {
	gulp.watch(src.coffee, ['cafe']);
});
