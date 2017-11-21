const gulp=require('gulp');
const esm2common=require('gulp-esm2common');
const rename=require('gulp-rename');

gulp.task("common",function(){
  return gulp.src("./src/**/*.js")
  .pipe(esm2common())
  .pipe(gulp.dest("./common"));
});

gulp.task("css",function(){
  return gulp.src("./dist/**/*.css")
  .pipe(gulp.dest("./common"));
});

gulp.task("default",function(){
  gulp.run(['common','css']);
});
