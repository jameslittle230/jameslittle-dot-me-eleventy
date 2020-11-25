function extractPostSlug(value) {
  // test that value is of the format 6-asdf.md
  let slug = value.match(/\d+-([a-zA-Z0-9-]+)/);
  if (slug.length === 2) {
    return slug[1];
  } else {
    throw `Can't extract post slug from ${value}`;
  }
}

module.exports = extractPostSlug;
