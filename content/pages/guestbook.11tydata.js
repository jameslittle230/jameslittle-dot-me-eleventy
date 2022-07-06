const EleventyFetch = require("@11ty/eleventy-fetch");

async function fetchGuestbookEntries() {
  const url = "https://api.jameslittle.me/guestbook";
  const response = await EleventyFetch(url, {
    duration: "1d",
    type: "json",
  });

  var entries = response.items;

  entries.forEach((e) => {
    e.created_at = new Date(e.created_at);
  });

  entries = entries.sort((l, r) => r.created_at - l.created_at);

  console.log(`Found ${entries.length} guestbook entries`);

  return entries;
}

module.exports = async function () {
  return {
    guestbook: await fetchGuestbookEntries(),
  };
};
