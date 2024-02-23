[extension page](chrome://extensions/)

```bash
uglifyjs src/main.js -o app/main.min.js --compress --mangle
uglifyjs src/searcher.js -o app/searcher.min.js --compress --mangle
uglifyjs src/beautify.js -o app/beautify.min.js --compress --mangle

uglifycss src/searcher.css > app/searcher.min.css
```

