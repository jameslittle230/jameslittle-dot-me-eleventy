const { format } = require("date-fns-tz");

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
