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

const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const matter = require('gray-matter');
const pug = require('pug');
const path = require('path');

const templates = {};
const rootDir = path.resolve(__dirname, '../');
const folders = ['writing', 'journal', 'speaking', 'traveling', 'about'];

(async () => {
  try {
    const files = await glob(`+(${folders.join('|')})/**/*.md`);
    console.log(files);

    files.map(file => {
      const { data, content } = matter.read(file);

      let templateFn = templates[data.template];

      if (!templateFn) {
        const templatePath = path.resolve(rootDir, `templates/${data.template}.pug`);
        
        templates[data.template] = pug.compileFile(templatePath);
        templateFn = templates[data.template];
      }

      const index = path.join(path.dirname(file), 'index.html');
      writeFileAsync(index, templateFn({ content }));
    })

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
