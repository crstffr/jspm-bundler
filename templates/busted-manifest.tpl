(function(module) {

    var bust = {};
    var systemLocate = System.locate;
    var systemNormalize = System.normalize;

    var chksums = module.exports.chksums = ${chksums};

    var bundles = module.exports.bundles = ${bundles};

    System.config({bundles: bundles});

    System.normalize = function (name, pName, pAddress) {
        return systemNormalize.call(this, name, pName, pAddress).then(function (address) {
            var chksum = chksums[name];
            address = address.replace(/\.gz\.js$/, '.gz');
            if (chksums[name]) { bust[address] = chksum; }
            return address;
        });
    };

    System.locate = function (load) {
        return Promise.resolve(systemLocate.call(this, load)).then(function (address) {
            var chksum = bust[address];
            return (chksum) ? address + '?' + chksum : address;
        });
    };

})((typeof module !== 'undefined') ? module : {exports: {}}, this);
