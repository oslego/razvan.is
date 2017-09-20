/*

# Build process

- iterate through first-level child folders in:
  journal/
  writing/
  about/
  traveling/
  speaking/

## Script build
- for every main.js run babel:
  - generate script-[hash].js
  - generate script-es5-[hash].js

## Style build
- for every style.less run less:
  - run autoprefixer

## [TODO] Images build
- generate resp images (files + markup)

## HTML build
- for every Markdown file:
  - extract YAML config with frontmatter
  - apply PUG template from config
    - populate local scripts block (body end) with script build
    - populate local styles block (head) with with style build
      - if style content < x KB, replace <link> with critical path <style>
  - generate HTML file as index.html

*/

const { writeFile } = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const writeFileAsync = promisify(writeFile);
const matter = require('gray-matter');
const path = require('path');
const viperHTML = require('viperhtml');
const marked = require('marked');

// Synchronous highlighting with highlight.js
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

const templates = {};
const folders = ['writing', 'journal', 'speaking', 'traveling', 'about'];

(async () => {
  try {
    // Grab all .md files in target folders and any sub-folders.
    const files = await glob(`+(${folders.join('|')})/**/*.md`);

    files.forEach(file => {
      const { data, content } = matter.read(file);
      const model = {
        title: data.title,
        content: { html: marked(content) }
      }

      let templateFn = templates[data.template];

      if (!templateFn) {
        templates[data.template] = require(`../templates/${data.template}.js`)
        templateFn = templates[data.template];
      }

      const index = path.join(path.dirname(file), 'index.html');
      const html = templateFn(viperHTML.wire(), model);
      writeFileAsync(index, html );
    })

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
