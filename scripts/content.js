// dependencies
const marked = require('marked');
const highlight = require('highlight.js');
// Synchronous highlighting with highlight.js
marked.setOptions({
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }
});

function build (string) {
  return marked(string)
}


module.exports = build;
