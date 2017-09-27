var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var jspm = require('jspm');
var async = require('async');
var mkdirp = require('mkdirp');
var chksum = require('checksum');
var Builder = require('jspm').Builder;
var invalidFileRegex = /[<>:"\/\\|?*]/g;
var root = path.dirname(module.parent.filename) + '/';

/*
console.log('root', root);
console.log('__dirname', __dirname);
console.log('__filename', __filename);
console.log('module.parent', module.parent);
*/

module.exports = JSPMBundler;

function JSPMBundler(opts) {

    opts = opts || {};

    var _this = this;

    var _bundles = {};

    var _system = {
        config: {},
        baseURL: opts.baseURL || '',
        packagePath: opts.packagePath || '',
        configFile: opts.configFile || 'config.js'
    };

    if (!path.isAbsolute(_system.baseURL)) {
        _system.baseURL = path.join(root, _system.baseURL, '/') || root;
    }

    if (!path.isAbsolute(_system.packagePath)) {
        _system.packagePath = path.join(root, _system.packagePath, '/') || root;
    }

    _system.config = _getSystemJSConfig();

    var _opts = _.defaults(opts || {}, {
        dest: '',
        file: '',
        bust: false,
        bundles: {},
        builder: {
            sfx: false,
            minify: false,
            mangle: false,
            sourceMaps: false,
            separateCSS: false,
            lowResSourceMaps: true
        }
    });

    _bundles = _opts.bundles;

    /**
     * Set the bundle configuration map.
     *
     * @param {Object} bundleConfig
     * @returns {JSPMBundler}
     */
    this.bundles = function (bundleConfig) {
        _bundles = bundleConfig;
        return _this;
    };

    /**
     * Create bundles using the bundle configuration. If no bundles are
     * specified, all groups will be bundles.
     *
     * Example:
     * bundler.bundle(['app', 'routes']);
     *
     * @param {Array} groups
     * @returns {Promise}
     */
    this.bundle = function (groups) {

        if (_.isEmpty(_bundles)) {
            throw new Error('Cant bundle until bundles are defined');
        }

        console.log('-- Bundling -------------');

        var promises = [];
        var completed = [];
        groups = (groups) ? groups : _.keys(_bundles);
        groups = (_.isArray(groups)) ? groups : [groups];

        _.forEach(groups, function (groupName) {
            promises.push(async.asyncify(function () {
                return _bundleGroup(groupName).then(function (bundles) {
                    completed = completed.concat(bundles);
                });
            }));
        });

        return new Promise(function (resolve, reject) {
            async.series(promises, function(err, results){
                if (err) { reject(err); }
                else { resolve(results); }
            });
        }).then(function(){
            if (_opts.bust) {
                return _calcChecksums(completed).then(function (checksums) {
                    _updateBundleManifest(completed, checksums).then(function(){
                        console.log('-- Complete -------------');
                    });
                });
            } else {
                return _updateBundleManifest(completed).then(function(){
                    console.log('-- Complete -------------');
                });
            }
        });
    };

    /**
     *
     * @param {Array} groups
     */
    this.unbundle = function (groups) {

        console.log('-- Unbundling -----------');

        if (!groups) {
            console.log('Removing all bundles...');
            return _writeBundleManifest(null);
        }

        groups = (groups) ? groups : _.keys(_bundles);
        groups = (_.isArray(groups)) ? groups : [groups];

        var unbundles = [];
        var shortPath = '';

        _.forEach(groups, function (groupName) {

            var bundleOpts = _getBundleOpts(groupName);

            if (bundleOpts.combine) {

                shortPath = _getBundleShortPath(groupName, bundleOpts);
                unbundles.push({path: shortPath});
                console.log(' ✔ Removed:', shortPath);

            } else {

                _.forEach(bundleOpts.items, function (item) {
                    shortPath = _getBundleShortPath(item, bundleOpts);
                    unbundles.push({path: shortPath});
                    console.log(' ✔ Removed:', shortPath);
                });

            }

        });

        return _removeFromBundleManifest(unbundles);

    };


    /**
     * Build the options object for a bundle
     *
     * @param {String} name
     * @returns {Object} options
     * @private
     */
    function _getBundleOpts(name) {
        var bundleOpts = _bundles[name];
        if (bundleOpts) {
            bundleOpts.builder = _.defaults(bundleOpts.builder, _opts.builder);
            return bundleOpts;
        } else {
            return false;
        }
    }

    /**
     * Build the destination path for a bundle
     *
     * @param {String} bundleName
     * @param {Object} bundleOpts
     * @returns {string}
     * @private
     */
    function _getBundleDest(bundleName, bundleOpts) {

        var url = path.join(_system.baseURL, _opts.dest);
        var min = bundleOpts.builder.minify;
        var name = bundleOpts.items[bundleName] || bundleName;
        var file = name + ((min) ? '.min.js' : '.js');

        if (bundleOpts.combine) {
            url = path.join(url, bundleName, file);
        } else {
            url = path.join(url, file);
        }

        return url;
    }

    /**
     *
     * @param bundleName
     * @param bundleOpts
     * @returns {string}
     * @private
     */
    function _getBundleShortPath(bundleName, bundleOpts) {
        var fullPath = _getBundleDest(bundleName, bundleOpts);
        return fullPath.replace(_system.baseURL, '');

    }

    /**
     *
     * @param {String} bundleName
     * @returns {Promise}
     * @private
     */
    function _bundleGroup(bundleName) {

        var bundleOpts = _getBundleOpts(bundleName);

        if (!bundleOpts) {

            return Promise.reject('Unable to find group: ' + bundleName);

        } else if (bundleOpts.bundle === false) {

            return Promise.resolve('Skipping: ' + bundleName);

        }

        console.log('Bundling group:', bundleName, '...');

        var promises = [];
        var completed = [];
        var bundleItems, minusStr;
        var bundleStr, bundleDest;

        bundleStr = '';
        bundleItems = bundleOpts.items || [];
        bundleItems = (_.isArray(bundleItems)) ? bundleItems : _.keys(bundleItems);
        minusStr = _exclusionString(bundleOpts.exclude, _bundles);

        if (bundleOpts.combine) {

            // Combine all the items in the group and bundle together.

            bundleDest = _getBundleDest(bundleName, bundleOpts);
            bundleStr = bundleItems.join(' + ') + minusStr;
            promises.push(async.asyncify(function () {
                return _bundle(bundleName, bundleStr, bundleDest, bundleOpts).then(function (bundle) {
                    completed.push(bundle);
                    return bundle;
                });
            }));

        } else {

            // Bundle each of the items in the group individually.

            _.forEach(bundleItems, function (itemName) {

                promises.push(async.asyncify(function () {

                    bundleStr = itemName + minusStr;
                    bundleDest = _getBundleDest(itemName, bundleOpts);

                    return _bundle(itemName, bundleStr, bundleDest, bundleOpts).then(function (bundle) {
                        completed.push(bundle);
                        return bundle;
                    });
                }));
            });
        }

        return new Promise(function (resolve, reject) {
            async.series(promises, function (err, results) {
                if (err) { reject(err); }
                else { resolve(completed); }
            });
        });
    };


    /**
     *
     * @param bundleName
     * @param bundleStr
     * @param bundleDest
     * @param bundleOpts
     * @returns {Promise}
     * @private
     */
    function _bundle(bundleName, bundleStr, bundleDest, bundleOpts) {

        var builder = new Builder({separateCSS: bundleOpts.builder.separateCSS});

        // Determine whether we use bundle or buildStatic (sfx option)
        var sfx = bundleOpts.builder.sfx;
        var bundler = (sfx) ? builder.buildStatic : builder.bundle;

        var shortPath = _getBundleShortPath(bundleName, bundleOpts);
        var filename = path.parse(bundleDest).base;

        if (invalidFileRegex.test(filename)) {
            return Promise.reject(bundleDest + ' is an invalid destination');
        }

        // Set builder configuration

        builder.config(bundleOpts.builder.config);

        return new Promise(function (resolve, reject) {

            mkdirp.sync(path.dirname(bundleDest));

            bundler.bind(builder)(bundleStr, bundleDest, bundleOpts.builder).then(function (output) {

                if (sfx) {
                    console.log(' ✔ Built sfx package:', bundleName, ' -> ', filename);
                } else {
                    console.log(' ✔ Bundled:', bundleName, ' -> ', filename);
                }

                resolve({
                    path: shortPath,
                    modules: output.modules
                });

            }).catch(function (err) {

                reject(err);
                return Promise.reject(err);

            });
        });
    }


    /**
     *
     * @returns {String}
     * @private
     */
    function _getBundleManifestPath() {
        var url = _system.baseURL;
        return String(path.join(url, _opts.file));
    }

    /**
     *
     * @returns {Object}
     * @private
     */
    function _getBundleManifest() {
        var data, path = _getBundleManifestPath();
        try {
            data = require(path);
        } catch (e) {
            data = {};
        }
        return data;
    }


    /**
     *
     * @param bundles
     * @param chksums
     * @private
     */
    function _updateBundleManifest(bundles, chksums) {

        chksums = chksums || {};

        var manifest = _.defaults(_getBundleManifest() || {}, {
            bundles: {},
            chksums: {}
        });

        _.forEach(bundles, function (bundle) {
            if (bundle.path) {
                manifest.bundles[bundle.path] = bundle.modules;
                manifest.chksums[bundle.path] = chksums[bundle.path] || '';
            }
        });

        return _writeBundleManifest(manifest);

    }

    /**
     *
     * @param bundles
     * @private
     */
    function _removeFromBundleManifest(bundles) {

        var manifest = _.defaults(_getBundleManifest() || {}, {
            bundles: {},
            chksums: {}
        });

        _.forEach(bundles, function (bundle) {
            delete manifest.bundles[bundle.path];
            delete manifest.chksums[bundle.path];
        });

        return _writeBundleManifest(manifest);

    }

    /**
     *
     * @param manifest
     * @private
     */
    function _writeBundleManifest(manifest) {

        if (!_opts.file) {
            return Promise.resolve();
        }

        console.log('Writing manifest...');

        var output = '';
        var template = '';
        var templateName = '';
        var templatePath = '';

        if (manifest) {

            try {

                templateName = (_opts.bust) ? 'busted-manifest.tpl' : 'simple-manifest.tpl';
                templatePath = path.join(__dirname, 'templates', templateName);
                template = fs.readFileSync(templatePath, 'utf8');

            } catch(e) {

                console.log(' X Unable to open manifest template');
                console.log(e);
                return;

            }

            output = _.template(template)({
                chksums: JSON.stringify(manifest.chksums, null, '    '),
                bundles: JSON.stringify(manifest.bundles, null, '    '),
            });

        }

        fs.writeFileSync(_getBundleManifestPath(), output);

        console.log(' ✔ Manifest written');

        return Promise.resolve();

    }


    /**
     *
     * @param {Object} bundles
     * @returns {Promise}
     * @private
     */
    function _calcChecksums(bundles) {

        var chksums = {};
        var promises = [];
        var filepath, filename;

        console.log('Calculating checksums...');

        _.forEach(bundles, function (bundle) {

            if (!_.isObject(bundle)) {
                return;
            }

            promises.push(async.asyncify(function () {
                return new Promise(function (resolve) {
                    filepath = path.join(_system.baseURL, bundle.path);
                    filename = path.parse(bundle.path).base;
                    chksum.file(filepath, function (err, sum) {
                        if (err) {
                            console.log(' Checksum Error:', err);
                        }
                        console.log(' ✔', filename, sum);
                        chksums[bundle.path] = sum;
                        resolve(sum);
                    });
                });
            }));
        });

        return new Promise(function (resolve) {
            async.waterfall(promises, function () {
                resolve(chksums);
            });
        });
    }


    /**
     * Load JSPM and the user's config.js to get the map
     * @returns {System.config}
     * @private
     */
    function _getSystemJSConfig() {
        var jspm = require('jspm');
        jspm.setPackagePath(_system.packagePath);
        var file = path.join(_system.baseURL, _system.configFile);
        require(file);
        return System.config;
    }


    /**
     *
     * @param {Array|Object} exclude
     * @param {Object} groups
     * @returns {String}
     * @private
     */
    function _exclusionString(exclude, groups) {
        var str = _exclusionArray(exclude, groups).join(' - ');
        return (str) ? ' - ' + str : '';
    }

    /**
     *
     * @param {Array|Object} exclude
     * @param {Object} groups
     * @returns {Array}
     * @private
     */
    function _exclusionArray(exclude, groups) {
        var minus = [];
        exclude = (_.isArray(exclude)) ? exclude : _.keys(exclude);
        _.forEach(exclude, function (item) {
            var group = groups[item];
            if (group) {
                // exclude everything from this group
                minus = minus.concat(_exclusionArray(group.items, groups));
            } else {
                // exclude this item by name
                minus.push(item);
            }
        });
        return minus;
    }

}


/*
 // Carry over from gulpfile. Needs to be integrated

 function _getBundleInfo(entryPoint) {

 require(_paths.config.system); // loads System.config();
 var map = System.map; // populated from System.config();
 var package = map[entryPoint];

 var out = {
 pathname: '',
 packname: ''
 };

 if (package) {

 var version = package.split('@')[1];
 out.packname = entryPoint + '@' + version;
 out.pathname = 'libs/' + out.packname;

 } else {

 var parts = entryPoint.split('/');
 out.packname = _.last(parts);
 out.pathname = _.initial(parts).join('/');

 }

 out.relpath = 'bundle/' + out.pathname + '/';
 out.abspath = _paths.static + out.relpath;
 out.destname = out.packname + '.min.js';
 out.dest = out.abspath + out.destname;

 return out;

 }

 */
