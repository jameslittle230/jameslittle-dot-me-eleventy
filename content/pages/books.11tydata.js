require("dotenv").config();
const Airtable = require("airtable");
const { utcToZonedTime, format } = require("date-fns-tz");
const { AssetCache } = require("@11ty/eleventy-fetch");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

Array.prototype.uniqued = function () {
  var output = [];
  for (const val of this) {
    if (output.indexOf(val) === -1) {
      output.push(val);
    }
  }
  return output;
};

const booksBaseKey = "appktTl97d89xOZQa";
var base = Airtable.base(booksBaseKey);

let asset = new AssetCache("airtable_books");

const getAirtableEntries = new Promise((resolve, reject) => {
  if (asset.isCacheValid("1d")) {
    // return cached data.
    asset.getCachedValue().then(resolve);
  }

  var books = [];

  base("Reading List")
    .select()
    .eachPage(
      (records, fetchNextPage) => {
        // called for each page of records (100 records/page)

        try {
          for (const record of records) {
            if (!record.get("Completion Date")) {
              break;
            }
            const completed = utcToZonedTime(
              new Date(record.get("Completion Date"))
            );
            const year = format(completed, "yyyy", { timeZone: "Etc/GMT" });
            const datum = {
              title: record.get("Title"),
              author: record.get("Author"),
              completed,
              year,
            };
            books.push(datum);
          }

          fetchNextPage();
        } catch (e) {
          console.error(e);
        }
      },
      (err) => {
        if (err) reject(err);
        else {
          asset.save(books, "json").then(() => {
            resolve(books);
          });
        }
      }
    );
});

const processAirtableEntries = (data) => {
  const years = data
    .map((d) => d.year)
    .uniqued()
    .sort((a, b) => b - a); // reverse sort years

  const yearListings = years.map((year) => ({
    year,
    books: data
      .filter((d) => d.year === year)
      .sort((a, b) => a.completed - b.completed),
  }));

  return {
    count: data.length,
    yearListings,
  };
};

async function fetchBookData() {
  const airtableEntries = await getAirtableEntries;
  const processedEntries = processAirtableEntries(airtableEntries);
  console.log(`Found ${processedEntries.count} books read`);
  return processedEntries;
}

module.exports = async function () {
  return await fetchBookData();
};
