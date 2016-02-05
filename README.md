# html-import-tree
Analyzes HTML imports/Web Components with Hydrolysis and displays a pretty dependency tree.

# Use with Gulp

```
 npm install --save ThatJoeMoore/html-import-tree
```

In your gulpfile:

```
gulp.task('html-import-tree', function (cb) {
    require('html-import-tree').tree('index.html', cb);
});
```
