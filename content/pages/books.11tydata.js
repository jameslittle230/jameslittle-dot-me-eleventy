const Airtable = require("airtable");
const { zonedTimeToUtc, utcToZonedTime, format } = require("date-fns-tz");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

const booksBaseKey = "appktTl97d89xOZQa";
var base = Airtable.base(booksBaseKey);

const getBooks = new Promise((resolve, reject) => {
  var books = {};

  base("Reading List")
    .select()
    .eachPage(
      (records, fetchNextPage) => {
        // called for each page of records (100 records/page)

        for (const record of records) {
          const date = utcToZonedTime(new Date(record.get("Completion Date")));
          const year = format(date, "yyyy", {timeZone: "Etc/GMT"});
          const datum = {
            title: record.get("Title"),
            author: record.get("Author"),
            completed: new Date(record.get("Completion Date")),
          };

          if (books[year]) {
            books[year].push(datum);
          } else {
            books[year] = [datum];
          }
        }

        fetchNextPage();
      },
      (err) => {
        if (err) reject(err);
        else {
          for (const year in books) {
            books[year].sort((a, b) => a.completed - b.completed);
          }

          resolve(books)
        };
      }
    );
});

module.exports = async function () {
  return {
    books: await getBooks
  }
};
