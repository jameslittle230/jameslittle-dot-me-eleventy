const { format } = require("date-fns-tz");

/**
 * Given a collection where each object has a .date field, returns a sorted
 * array of unique years present in the collection: ["2017", "2018", "2019"]
 * 
 * @param {Eleventy Collection} collection 
 */
function uniquePostYears(collection) {
  Array.prototype.uniqued = function () {
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
    .map((p) => p.date)
    .map((d) => format(d, "yyyy"))
    .uniqued()
    .sort();
}

/**
 * Adds .year properties to all objects in a collection, where .year is the
 * post's date formatted as just the year.
 * 
 * @param {Eleventy Collection} collection 
 */
function postsWithYears(collection) {
  var coll = collection.getFilteredByTag("post");

  coll.map((p) => {
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
}

module.exports = { uniquePostYears, postsWithYears };
