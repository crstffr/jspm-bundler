## v0.1.9

* Reverted back, issue with JSPM v0.16.34
* Pinned npm dependencies.

## v0.1.8

* Updated to JSPM v0.16.34

## v0.1.7

* Fixed bug with bundle() promise resolving too soon [#9](https://github.com/crstffr/jspm-bundler/issues/9)

## v0.1.6

* Option to specify output filename for each item separately. [#7](https://github.com/crstffr/jspm-bundler/issues/7)
* Option ```sfx``` for building self-extracting bundles. [#8](https://github.com/crstffr/jspm-bundler/issues/8)
* Fix issue with absolute baseURL paths not resolving correctly. [#9](https://github.com/crstffr/jspm-bundler/issues/9)
* Option ```builder.config``` for overriding system config.js. [#10](https://github.com/crstffr/jspm-bundler/issues/10)

## v0.1.5

* Test for valid destination filenames, error on invalid names. [#4](https://github.com/crstffr/jspm-bundler/issues/4)
* Reject bundle() promise on various errors. [#5](https://github.com/crstffr/jspm-bundler/issues/5)
* Allow separateCSS builder option. [#6](https://github.com/crstffr/jspm-bundler/issues/6)
* Added example gulpfile and bundle.config.
* Remove gzip support, didn't work out.

## v0.1.4

Testing out gzip support, not documenting it in the readme yet.

## v0.1.3

Added cache busting using generated checksums.

* Inject custom System.normalize and System.locate loaders.
* Unbundling all groups empties bundle manifest completely.

Config option added:

* bust: true|false

## v0.1.2

Bugs and tweaks.

* Bundle config map can be passed in on instantiation.
* Fixed bug with unbundle() not returning promise.

Config options changed:

* bundleDest -> dest
* bundleFile -> file

## v0.1.1

Bug fixes.

* Works inside gulp tasks
* Added ```baseURL``` bundler config option

## v0.1.0

Initial release.

Features:

* Writes manifest to external file
* Bundle grouping with group exclusions
* Checksum calculations added to manifest

Config options:

* bundleDest
* bundleFile
* builder

Available methods:

* builder.bundles({})
* builder.bundle([])
* builder.unbundle([])

