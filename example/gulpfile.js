var gulp = require('gulp');
var minimist = require('minimist');
var Bundler = require('jspm-bundler');
var config = require('./bundle.config');

/**
 * Bundle all groups, or single groups individually
 *
 * gulp bundle
 * gulp bundle -g core
 * gulp bundle -g modules
 */
gulp.task('bundle', [], function () {
    var options = minimist(process.argv.slice(2));
    var bundler = new Bundler(config);
    return bundler.bundle(options.g);
});

/**
 * Remove bundle config for all groups, or single groups individually.
 *
 * gulp unbundle
 * gulp unbundle -g core
 * gulp unbundle -g modules
 */
gulp.task('unbundle', [], function () {
    var minimist = require('minimist');
    var options = minimist(process.argv.slice(2));
    var bundler = new Bundler(config);
    return bundler.unbundle(options.g);
});
