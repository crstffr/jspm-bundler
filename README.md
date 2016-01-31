# jspm-bundler

A more configurable bundler for JSPM.  Saves bundle configuration to an external JS file
(instead of your config.js) so that it can be easily excluded from git repos and updated
independently of the config.js.

* Easier management of exclusions (exclude groups or packages)
* Bundle/unbundle specific groups


## Installation

```
npm install jspm-bundler --save-dev
```

## Usage

In your HTML

```html
<script src="./jspm_packages/system.js"></script> <!-- SystemJS -->
<script src="./config.js"></script> <!-- your SystemJS config -->
<script src="./bundles.js"></script> <!-- your bundleFile -->
```

In gulpfile or other Node build script.

```javascript
var Bundler = require('jspm-bundler);

var bundler = new Bundler({
    bundleDest: './bundles/',
    bundleFile: './bundles.js',
    builder: {
        minify: true,
        mangle: true
    }
});
```

Load your bundle configuration

```javascript
bundler.bundles({
    cdn: {
        bundle: false,
        items: [
            'angular',
            'lodash',
            'jquery'
        ]
    },
    deps: {
        combine: true,
        exclude: ['cdn'],
        items: [
            'angular-foundation',
            'angular-ui-router',
            'angular-sanitize',
            'angular-cookie',
            'ui-router-extras',
        ]
    },
    app: {
        exclude: ['cdn', 'deps'],
        items: ['app/app']
    },
    routes: {
        exclude: ['cdn', 'deps', 'app'],
        items: [
            'routes/index.route',
            'routes/users/users.route',
            'routes/orders/orders.route',
            'routes/products/products.route'
        ]
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

## Bundler Config

```javascript
var bundler = new Bundler({

    // both of these paths are relative to your SystemJS baseURL.

    bundleDest: '', // path to folder where bundles are saved
    bundleFile: '', // JS file where bundle config is written

    builder: {      // global build options passed to jspm.Builder
        minify: false,
        mangle: false,
        sourceMaps: false
    }
});
```


## Bundle Group Config

```javascript
bundler.bundles({
    groupName: {
        bundle: true,       // whether to bundle this group
        combine: false,     // combine items together via addition
        exclude: []         // exclude groups or packages via subtraction
        items: [],          // list of packages or files to bundle,

        builder: {          // options passed to jspm.Builder
            minify: false,  // these override the global options
            mangle: false,
            sourceMaps: false,
            // etc ...
        }
    }
});
```
