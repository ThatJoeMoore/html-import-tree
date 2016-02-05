/**
 * Created by ThatJoeMoore on 2/5/16.
 */

var hydro = require('hydrolysis');
var g = require('gulp-util');

module.exports = {
    tree: function (input, callback) {
        var opts;
        if (typeof input === 'string') {
            opts = {entrypoint: input};
        } else {
            opts = input;
        }

        var elements = {};

        hydro.Analyzer.analyze(opts.entrypoint, {clean: true})
            .then(function (analyzer) {
                var all = analyzer.html;
                for (var file in all) {
                    var scan = all[file];

                    var info = getFileInfo(file);
                    info.imports = scan.depHrefs;
                    info.imports.forEach(function (each) {
                        var importedInfo = getFileInfo(each);
                        importedInfo.importedBy.push(file);
                    });
                    info.scanned = true;
                }

                output(opts.entrypoint, null, '', true);

                if (callback) callback();
            });

        function rebase(file) {
            if (!opts.base) {
                return file;
            }
            if (file.indexOf(opts.base) == 0) {
                return file.substring(opts.base.length);
            }
            return file;
        }

        function output(file, parent, prefix, isLast) {
            var info = elements[file];

            var isPolymer = file.indexOf('/polymer.html') >= 0;

            var fileName = rebase(file);

            var name = g.colors.green(fileName);

            if (file.indexOf('bower_components') >= 0) {
                name = g.colors.yellow(fileName);
            }
            if (!info.scanned) {
                name = g.colors.bgRed(fileName);
            }
            if (isPolymer) {
                name = g.colors.blue(fileName);
            }

            var tick = isLast ? '`' : '+';

            var line = prefix + tick+ '-- ' + name;

            if (isPolymer) {
                g.log(line);
                return;
            }

            if (info.importedBy.length > 1) {
                var otherImports = ' (also by ';
                var filtered = info.importedBy.filter(function(each) {
                    return each !== parent;
                });
                if (info.logged) {
                    otherImports += 'others, see above';
                } else {
                    var toJoin = filtered;
                    var truncate = filtered.length > 2;
                    if (truncate) {
                        toJoin = filtered.slice(0, 2);
                        toJoin.push('and ' + (filtered.length - 2) + ' others');
                    }
                    otherImports += toJoin.join(', ');
                    info.logged = true;
                }
                otherImports += ')';
                line += g.colors.dim(otherImports);
            }

            g.log(line);

            var newPrefix = prefix + (isLast ? '   ' :'|  ');

            info.imports.forEach(function(each, index, array) {
                var last = index === array.length - 1;
                output(each, file, newPrefix, last);
            });
        }

        function getFileInfo(file) {
            if (!(file in elements)) {
                elements[file] = {
                    name: file,
                    imports: [],
                    importedBy: [],
                    scanned: false,
                    logged: false
                };
            }
            return elements[file];
        }
    }
};
