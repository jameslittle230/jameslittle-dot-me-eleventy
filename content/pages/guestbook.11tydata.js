const EleventyFetch = require("@11ty/eleventy-fetch");

async function fetchGuestbookEntries() {
  const url = "https://api.jameslittle.me/guestbook";
  const response = await EleventyFetch(url, {
    duration: "1d",
    type: "json",
  });

  var { items } = response;
  items.forEach((i) => {
    i.created_at = new Date(i.created_at);
  });
  items = items.reverse();
  console.log(`Found ${items.length} guestbook entries`);
  return items;
}

module.exports = async function () {
  return {
    guestbook: await fetchGuestbookEntries(),
  };
};
