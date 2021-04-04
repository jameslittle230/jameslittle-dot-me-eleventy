const urlParser = require("url");
const http = require("http");
const https = require("https");
const sizeOf = require("image-size");
const sharp = require("sharp");

exports.img = function img(r, urlbase, classList, style) {
  var ratio = r;
  var classList = classList;
  var style = style;
  var urlbase = urlbase;

  if (typeof r == "object") {
    urlbase = r.urlbase;
    classList = r.classList;
    style = r.style;
    ratio = r.ratio;
  }

  return `<div style="${style || ""}" class="${classList || ""}">
    <div class="picture-placeholder" style="padding-top: ${ratio}"></div>
    <picture class="over-placeholder">
        <source type="image/webp" srcset="${urlbase}.webp">
        <source type="image/jpeg" srcset="${urlbase}.jpg">
        <img src="${urlbase}.jpg" alt="">
    </picture>
    </div>`;
};

exports.autoImg = async ({
  url,
  variants = [],
  alt = null,
  style = "",
  classList = [],
}) => {
  // Step 1: Fetch image
  const imageBuffer = await new Promise((resolve, reject) => {
    const options = new urlParser.URL(url);
    https.get(options, (response) => {
      if (response.statusCode != 200) {
        reject(`Could not fetch ${url}, status code ${response.statusCode}`);
      }
      const chunks = [];
      response
        .on("data", (chunk) => {
          chunks.push(chunk);
        })
        .on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
    });
  });

  const urlBase = (() => {
    let arr = url.split(".");
    arr.pop();
    return arr.join(".");
  })();

  // Step 2: Get dimensions
  const { width, height } = sizeOf(imageBuffer);

  // create blurry placeholder
  const smallBufferBase64 = await new Promise((resolve, reject) => {
    sharp(imageBuffer)
      .resize({ height: 64 })
      .toFormat("png")
      .toBuffer((err, buf, info) => {
        if (err) reject(err);
        if (!err && buf) resolve(buf.toString("base64"));
      });
  });

  const wrappedSmallBufferBase64 = `data:image/png;base64, ${smallBufferBase64}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink= "http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}">
  <image filter="url(#blur)" width="${width}" height="${height}" xlink:href="${wrappedSmallBufferBase64}" />
  <filter id="blur">
      <feGaussianBlur stdDeviation=".5" />
  </filter>
</svg>`;

  const wrappedSvgBase64 = `data:image/svg+xml;base64,${Buffer.from(
    svg
  ).toString("base64")}`;

  classListString =
    typeof classList === "string" ? classList : classList.join(" ");

  return `
        <picture>
            ${variants
              .map((v) => {
                if (["avif", "webp", "png", "jpg"].includes(v)) {
                  return `<source type="image/${v}" srcset="${urlBase}.${v}">`;
                }
                return v;
              })
              .join("\n")}
            <img 
                width="${width}"
                height="${height}"
                style="background-size: cover; background-image:url('${wrappedSvgBase64}'); ${style}"
                class="${classListString}"
                loading="lazy" 
                decoding="async" 
                src="${url}"
                ${alt ? `alt="${alt}"` : ""} 
            />
        </picture>
    `;
};
