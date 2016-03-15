module.exports = {

    baseURL: '.',
    dest: 'dist',
    file: 'bundle.manifest.js',
    bust: true,

    builder: {
        minify: true,
        mangle: true,
        sourceMaps: true,
        separateCSS: true,
        lowResSourceMaps: false
    },

    bundles: {
        libs: {
            items: [
                'jquery',
                'angular',
                'lodash'
            ]
        },
        core: {
            exclude: ['libs'],
            items: ['app/core']
        },
        modules: {
            exclude: ['libs', 'core'],
            items: {
                'core/modules/users': 'user.module',        // outputs: dist/user.module.min.js
                'core/modules/items': 'item.module'         // outputs: dist/item.module.min.js
            }
        }
    }
};
