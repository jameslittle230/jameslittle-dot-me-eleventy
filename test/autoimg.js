const { autoImg } = require("../11ty/imagePartial.js");
autoImg({
  url: "https://files.jameslittle.me/images/headshot.jpg",
  variants: ["avif", "webp", "jpg"],
  alt: "hey there",
})
.then((r) => console.log(r));
