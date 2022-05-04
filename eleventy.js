const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const extractPostSlug = require("./11ty/extractPostSlug.js");
const {
  dateFormat,
  strictIsoDateFormat,
  relativeDate,
  dateOlderThan1y,
} = require("./11ty/dateFilters.js");
const { leftpad } = require("./11ty/leftpad.js");
const { htmlmin, cssmin, jsmin } = require("./11ty/minifiers.js");
const { uniquePostYears, postsWithYears } = require("./11ty/postYears.js");
const markdownLibrary = require("./11ty/markdownLibrary.js");

const imagePartial = require("./11ty/imagePartial.js");
const shortcodes = require("./11ty/shortcodes.js");

module.exports = function (eleventyConfig) {
  // PLUGINS
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  // CONFIGURATIONS
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPassthroughCopy({ "content/static/": "/" });
  eleventyConfig.setLibrary("md", markdownLibrary);
  eleventyConfig.addWatchTarget("content/styles/*");

  // FILTERS
  eleventyConfig.addFilter("extractPostSlug", extractPostSlug);
  eleventyConfig.addFilter("dateformat", dateFormat);
  eleventyConfig.addFilter("strictIsoDateFormat", dateFormat);
  eleventyConfig.addFilter("relativeDate", relativeDate);
  eleventyConfig.addFilter("dateOlderThan1y", dateOlderThan1y);
  eleventyConfig.addFilter("leftpad", leftpad);

  // HTML/CSS/JS TRANSFORMERS
  eleventyConfig.addTransform("htmlmin", htmlmin);
  eleventyConfig.addFilter("cssmin", cssmin);
  eleventyConfig.addNunjucksAsyncFilter("jsmin", jsmin);

  // SHORTCODES
  eleventyConfig.addShortcode("bigTitle", shortcodes.bigTitle);
  eleventyConfig.addAsyncShortcode("image", imagePartial.imageShortcode);

  // COLLECTIONS
  eleventyConfig.addCollection("uniquePostYears", uniquePostYears);
  eleventyConfig.addCollection("postsWithYears", postsWithYears);

  return {
    dir: {
      input: "./content",
      includes: "../includes",
      output: "./_site",
    },
  };
};
