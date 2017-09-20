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

const { writeFile, existsSync } = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const writeFileAsync = promisify(writeFile);
const path = require('path');
const matter = require('gray-matter');
const viperHTML = require('viperhtml');

const { toArray } = require('./util.js');
const buildCSS = require('./css');
const buildContent = require('./content');

const templates = {};
const folders = ['writing', 'journal', 'speaking', 'traveling', 'about'];

(async () => {
  try {
    // Grab all .md files in target folders and any sub-folders.
    const files = await glob(`+(${folders.join('|')})/**/*.md`);

    files.forEach(async file => {
      const cwd = path.dirname(file);
      const { data, content } = matter.read(file);

      // Array with stylesheet paths
      const paths = toArray(data.style).map(file => path.join(cwd, file));
      // Get CSS processing output
      const stylesheets = await buildCSS(paths);

      const model = {
        title: data.title,
        content: { html: buildContent(content) },
        style: { html: stylesheets.map(sheet => { return `<style type="text/css">${sheet.css}</style>` }) }
      }

      templates[data.template] = templates[data.template] || require(`../templates/${data.template}.js`);

      const html = templates[data.template].call(null, viperHTML.wire(), model);
      const index = path.join(cwd, 'index.html');
      writeFileAsync(index, html);
    })

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
