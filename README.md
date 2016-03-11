# jspm-bundler

A configurable bundler for JSPM. Saves bundle manifest to an external JS file
(instead of your config.js) so that it can be easily excluded from git repos
and updated independently of the config.js.

* Bundle/unbundle specific groups
* Easier management of exclusions (exclude groups or packages)
* Bust cached bundles using generated file checksums

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

    baseURL: '',     // must be the same baseURL as SystemJS

    // both of these paths are relative to your baseURL.
    dest: '',       // path to folder where bundles are saved
    file: '',       // JS file where bundle manifest is written

    bust: false,    // use file checksums to bust cached bundles

    builder: {      // global build options passed to jspm.Builder
        minify: false,
        mangle: false,
        sourceMaps: false
        // etc ...
    },

    bundles: {
        groupName: {            // group name (whatever you want)
            bundle: true,       // whether to bundle this group
            combine: false,     // combine items together via addition
            exclude: [],        // exclude groups or packages via subtraction
            items: [],          // list of packages or files to bundle,

            builder: {          // options passed to jspm.Builder
                minify: false,  // these override the global options
                mangle: false,
                sourceMaps: false
                // etc ...
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
