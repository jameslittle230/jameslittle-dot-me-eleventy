const axios = require("axios");

async function fetchGuestbookEntries() {
  const response = await axios.get("https://api.jameslittle.me/guestbook");

  var entries = response.data["Items"];

  entries.forEach((e) => {
    e.created_at = Number(e.created_at);
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
