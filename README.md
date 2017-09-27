# jspm-bundler

A configurable bundler for JSPM. Saves bundle manifest to an external JS file
(instead of your config.js) so that it can be easily excluded from git repos
and updated independently of the config.js.

* Bundle/unbundle specific groups
* Easier management of exclusions (exclude groups or packages)
* Bust cached bundles using generated file checksums
* Support for self-extracting bundles (aka static builds)

[![NPM](https://nodei.co/npm/jspm-bundler.png?downloads=true)](https://nodei.co/npm/jspm-bundler/)

## Installation

```
npm install jspm-bundler --save-dev
```

## Usage

In your HTML

```html
<script src="jspm_packages/system.js"></script> <!-- SystemJS -->
<script src="config.js"></script> <!-- your SystemJS config -->
<script src="bundles.js"></script> <!-- your bundleFile -->
```

In gulpfile or other Node build script.

```javascript
var Bundler = require('jspm-bundler');

var bundler = new Bundler({

    baseURL: '',                // Must be the same baseURL as SystemJS.
    configFile: '',             // System config (defaults to config.js)
    packagePath: '',            // Path to package.json (defaults to root)

    // Paths are relative to your baseURL.
    dest: 'bundles',            // Path to folder where bundles are saved.
    file: 'bundles.js',         // JS file where bundle manifest is written.

    bust: false,                // Use file checksums to bust cached bundles,
                                // does not work on self-extracting builds.

    builder: {                  // Global build options passed to jspm.Builder.

        sfx: false,             // Self-extracting bundle with buildStatic().
        minify: false,
        mangle: false,
        sourceMaps: false,
        separateCSS: false,
        lowResSourceMaps: true,

        config: {               // Config file overrides.
            map: {},
            meta: {},
            paths: {}
            ...
        }
    },

    bundles: {
        groupName: {            // Group name (whatever you want).

            bundle: true,       // Whether to bundle this group.
            combine: false,     // Combine items together via addition.
            exclude: [],        // Exclude groups or packages via subtraction.

            // Items can be a simple array of packages and/or application files.
            // Globs or wildcards are not supported.  Bundles are created by
            // traversing a dependency graph, so start with an entrypoint.
            // Do not use file extensions, SystemJS assumes .js extensions.

            items: [
                'angular',
                'jquery',
                'source/app'
            ],

            // Items can also be an object that specifies entry as key
            // and a different output filename (no file ext) as value

            items: {
                'source/app': 'distbundle'
            },

            builder: {          // Options override the global builder options.
                sfx: false,
                minify: false,
                mangle: false,
                sourceMaps: false,
                separateCSS: false,
                lowResSourceMaps: true,
                config: {
                    map: {},
                    meta: {},
                    paths: {}
                    ...
                }
            }
        }
    }
});
```

Bundle all groups in your bundle configuration

```javascript
bundler.bundle().then(function(){
    console.log('bundled all groups');
});
```

Bundle just specific groups

```javascript
bundler.bundle(['app','routes']).then(function(){
    console.log('bundled just the app and routes');
});
```

Remove entire bundle config

```javascript
bundler.unbundle().then(function(){
    console.log('all bundle configuration removed');
});
```

Remove individual bundle configs
```javascript
bundler.unbundle(['routes']).then(function(){
    console.log('bundle configuration removed for just routes');
});
```

## Examples

[Example Gulpfile](https://github.com/crstffr/jspm-bundler/blob/master/example/gulpfile.js)

[Example Bundle Config](https://github.com/crstffr/jspm-bundler/blob/master/example/bundle.config.js)

[Example SFX Build Config](https://github.com/crstffr/jspm-bundler/blob/master/example/build.sfx.config.js)

