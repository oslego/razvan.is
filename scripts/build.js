const { promisify } = require('util');
const { writeFile, existsSync } = require('fs');
const writeFileAsync = promisify(writeFile);
const glob = promisify(require('glob'));
const path = require('path');
const matter = require('gray-matter');
const viperHTML = require('viperhtml');

// Local dependecies
const { toArray } = require('./util.js');
const buildCSS = require('./css');
const buildContent = require('./content');

/*
  Build a specific website page (aka microsite)
  given the Markdown file that acts as its index file.

  Valid Markdown index files have a YAML header like this:
  ---
  title: Title of page    # Title of page to use in <title>
  template: base          # Name of template file to use from /templates/
  script: ./src/main.js   # Path of local scripts to build & inject into template
  style: ./src/styles.css # Path of local styles to process & inject into template
  ---
*/
async function buildMicrosite(file) {
  const cwd = path.dirname(file);
  const { data, content } = matter.read(file);

  // Early return if we caught a Markdown file that's not supposed to be built.
  if (!data.template) { return }

  // Array with stylesheet paths
  const stylesheetFiles = toArray(data.style).map( file => path.join(cwd, file) );

  // Get CSS processing output
  const stylesheets = await buildCSS(stylesheetFiles);

  const model = {
    title: data.title,
    content: { html: buildContent(content) },
    style: { html: stylesheets.map( sheet => { return `<style type="text/css">${sheet.css}</style>` } ) }
  }

  const renderFn = require(`../templates/${data.template}.js`);
  const html = renderFn(viperHTML.wire(), model);
  const index = path.join(cwd, 'index.html');

  writeFileAsync(index, html);
}

(async () => {
  const folders = ['writing', 'journal', 'speaking', 'traveling', 'about'];

  try {
    const argv = require('minimist')(process.argv.slice(2));

    // First argument, if given given, is expected to be a specific path to build.
    let buildPath = argv._[0];

    if (buildPath && !existsSync(buildPath)) {
      buildPath = path.join(__dirname, buildPath);
      if (!existsSync(buildPath)) {
        console.error(`Nonexistent build path: ${buildPath}`);
        process.exit(1);
      }
    }

    // If given a specific build path, find Markdown files (atomic build)
    // Else, find Markdown files in ALL expected folders and their sub-folders (whole site build)
    const files = buildPath
      ? await glob(`${buildPath}/*.md`)
      : await glob(`+(${folders.join('|')})/**/*.md`);

    console.log(files);
    files.forEach(file => buildMicrosite(file))

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
