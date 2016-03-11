module.exports = {

    baseURL: '.',
    dest: 'dist',
    file: 'bundle.js',
    bust: false,

    builder: {
        minify: true,
        mangle: true,
        sourceMaps: true,
        separateCSS: true,
        lowResSourceMaps: false
    },

    bundles: {
        libs: {
            bundle: false,
            items: ['jquery', 'angular', 'lodash']
        },
        core: {
            exclude: ['libs'],
            items: ['app/core']
        },
        modules: {
            exclude: ['libs', 'core'],
            items: [
                'core/modules/users',
                'core/modules/items'
            ]
        }
    }
};
