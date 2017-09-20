const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const atImport = require('postcss-import');
const autoprefixer = require('autoprefixer');

const autoprefixerPlugin = autoprefixer({
  browsers: ['last 2 versions']
})

function process(file) {
  const css = fs.readFileSync(file, "utf8");

  return postcss([ atImport, autoprefixerPlugin ])
    .process(css, {
      from: path.dirname(file)
    })
    .then(function (result) {
      return {
        css: result.css
      }
    })
}

function build (stylesheets) {
  return Promise.all(stylesheets.map(file => process(file)))
}

module.exports = build;
