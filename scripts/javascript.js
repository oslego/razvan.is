const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');

function build(entry, output, options) {
  rollup({
    input: entry,
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            "es2015",
            {
              "modules": false
            }
          ]
        ],
        exclude: 'node_modules/**'
      })
    ]
  }).then(out => {
    console.log(out)
    return out;
  })
}

module.exports = build
