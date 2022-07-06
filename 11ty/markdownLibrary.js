const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItAnchor = require("markdown-it-anchor");
const uslug = require("uslug");
const uslugify = (s) => uslug(s);

const markdownLib = markdownIt({ html: true, typographer: true });

markdownLib.use(markdownItFootnote);

markdownLib.use(markdownItAnchor, {
  permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
  slugify: uslugify,
});

markdownLib.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes"><ol class="footnotes-list">';

markdownLib.renderer.rules.footnote_block_closed = () => "</section></ol>";

module.exports = markdownLib;
