var gulp = require("gulp");
var sass = require("gulp-sass");

gulp.task("styles", () => {
  gulp.src("stylesheets/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./public/css/"))
})

gulp.task("watch", () => {
  gulp.watch("styleseets/**/*.scss", ["styles"])
})
