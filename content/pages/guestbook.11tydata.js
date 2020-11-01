const axios = require("axios");

async function fetchGuestbookEntries() {
  const response = await axios.get(
    "https://vipqpoael1.execute-api.us-west-1.amazonaws.com/prod"
  );

  if(process.env.ELEVENTY_ENV === "development") {
    response.data.shift();
  }

  console.log(`Found ${response.data.length} guestbook entries`)

  return response.data;
}

module.exports = async function () {
  return {
    guestbook: await fetchGuestbookEntries(),
    environment: process.env.ELEVENTY_ENV,
  };
};
