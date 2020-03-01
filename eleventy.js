const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { zonedTimeToUtc, utcToZonedTime, format } = require("date-fns-tz");
const mdit = require("markdown-it");
const mditfootnote = require("markdown-it-footnote");

const imagePartial = require("./includes/image-partial.js");

function minifyHtml(content, outputPath) {
  if (outputPath.endsWith(".html")) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }

  return content;
}

function extractPostSlug(value) {
  // test that value is of the format 6-asdf.md
  let slug = value.match(/\d+-([a-zA-Z0-9-]+)/);
  if (slug.length === 2) {
    return slug[1];
  } else {
    throw `Can't extract post slug from ${value}`;
  }
}

function dateformat(value, fmtstring = "yyyy-MM-dd") {
  let zonedDate = utcToZonedTime(value, "UTC");
  return format(zonedDate, fmtstring);
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addTransform("htmlmin", minifyHtml);

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter("extractPostSlug", extractPostSlug);
  eleventyConfig.addFilter("dateformat", dateformat);

  eleventyConfig.addPassthroughCopy("content/styles/");
  eleventyConfig.addPassthroughCopy({ "content/static/": "/" });

  eleventyConfig.addShortcode("img", imagePartial.img);

  let markdownLib = mdit({ html: true }).use(mditfootnote);
  markdownLib.renderer.rules.footnote_block_open = () =>
    '<section class="footnotes"><ol class="footnotes-list">';
  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addCollection("uniquePostYears", function(collection) {
    Array.prototype.uniqued = function() {
      var output = [];
      for (const val of this) {
        if (output.indexOf(val) === -1) {
          output.push(val);
        }
      }
      return output;
    };

    return collection
      .getFilteredByTag("post")
      .map(p => p.date)
      .map(d => dateformat(d, "yyyy"))
      .uniqued()
      .sort();
  });

  eleventyConfig.addCollection("postsWithYears", function(collection) {
    var coll = collection.getFilteredByTag("post");

    coll.map(p => {
      p.year = format(p.date, "yyyy");
      return p;
    });

    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
  });

  return {
    dir: {
      input: "./content",
      includes: "../includes",
      output: "./_site"
    }
  };
};
