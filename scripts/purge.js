const { existsSync } = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const remove = promisify(require('rimraf'));
const path = require('path');

const folders = ['writing', 'journal', 'speaking', 'traveling', 'about'];
const output = ['index.html', 'build'];

(async () => {
  try {
    const files = await glob(`+(${folders.join('|')})/**/*.md`);
    const dirs = files.map(file => path.dirname(file));

    dirs.forEach(dir => {
      output.forEach(file => {
        const toDelete = path.join(dir, file);
        existsSync(toDelete) && remove(toDelete);
      })
    })

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
