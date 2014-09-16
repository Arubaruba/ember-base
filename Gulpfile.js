var gulp = require('gulp'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  handlebars = require('gulp-handlebars'),
  order = require('gulp-order'),

  eventStream = require('event-stream'),
  emberHandlebars = require('ember-handlebars'),
  packageName = require('./package.json')['name'];

var buildPaths = {
  development: './tmp',
  production: 'dist'
};

var pipes = {
  localScripts: function () {
    return gulp.src([
      'app/app.js',
      'app/**/*.js'
    ])
      .pipe(uglify())
      .pipe(concat(packageName + '.local-scripts.js'));
  },
  dependencies: function () {
    return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/handlebars/handlebars.runtime.min.js',
      'bower_components/ember/ember.min.js',
      'bower_components/ember-data/ember-data.min.js'
    ])
      .pipe(concat(packageName + '.dependencies.js'));
  },
  templates: function () {
    return gulp.src([
      'app/**/*.hbs'
    ])
      .pipe(handlebars({
        handlebars: emberHandlebars
      }))
      .pipe(uglify())
      .pipe(concat(packageName + '.templates.js'));
  },
  sass: function () {
    return gulp.src('app/**/*.scss')
      .pipe(sass())
      .pipe(concat(packageName + '.css'));
  }
};

gulp.task('development', function () {
  eventStream.merge(
    pipes.dependencies(),
    pipes.localScripts(),
    pipes.templates(),
    pipes.sass()
  ).pipe(gulp.dest(buildPaths.development));

  watch('app/**/*.js', function () {
    pipes.localScripts().pipe(gulp.dest(buildPaths.development));
  });

  watch('app/**/*.hbs', function () {
    pipes.templates().pipe(gulp.dest(buildPaths.development));
  });

  watch('app/**/*.scss', function () {
    pipes.sass().pipe(gulp.dest(buildPaths.development));
  });
});

gulp.task('production', function () {
  eventStream.merge(
    pipes.dependencies(),
    pipes.templates(),
    pipes.localScripts()
  )
    .pipe(order(['*dependencies*', '*templates*', '*local-scripts*']))
    .pipe(concat(packageName + '.min.js'))
    .pipe(gulp.dest(buildPaths.production));

  pipes.sass().pipe(gulp.dest(buildPaths.production));
});
