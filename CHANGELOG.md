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

