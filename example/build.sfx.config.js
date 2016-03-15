module.exports = {

    baseURL: '.',
    dest: 'dist',
    bust: false, // sfx builds can't take advantage of cache-busting.

    builder: {
        sfx: true,
        minify: true,
        mangle: true,
        sourceMaps: true,
        separateCSS: true,
        lowResSourceMaps: false,
        globalDeps: {
            'angular': 'window.angular',
            'jquery': 'window.jQuery',
            'lodash': 'window._'
        }
    },

    bundles: {
        libs: {
            bundle: false,
            items: [
                'jquery',
                'angular',
                'lodash'
            ]
        },
        app: {
            combine: true,
            exclude: ['libs'],
            items: [                    // outputs sfx package: dist/app.min.js
                'app/core',
                'core/modules/users',
                'core/modules/items'
            ]
        }
    }
};
