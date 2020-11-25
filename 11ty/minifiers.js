const CleanCSS = require("clean-css");
const { minify } = require("terser");
const htmlMinifier = require("html-minifier");

function htmlmin(content, outputPath) {
  if (outputPath.endsWith(".html")) {
    let minified = htmlMinifier.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });
    return minified;
  }

  return content;
}

function cssmin(code) {
  return new CleanCSS({}).minify(code).styles;
}

async function jsmin(code, callback) {
  try {
    const minified = await minify(code);
    callback(null, minified.code);
  } catch (err) {
    console.error("Terser error: ", err);
    // Fail gracefully.
    callback(null, code);
  }
}

module.exports = { htmlmin, cssmin, jsmin };
