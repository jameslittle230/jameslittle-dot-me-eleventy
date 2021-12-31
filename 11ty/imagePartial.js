const Image = require("@11ty/eleventy-img");
const outdent = require("outdent");

const ImageWidths = {
  ORIGINAL: null,
  PLACEHOLDER: 24,
};

const imageShortcode = async (
  path,
  alt = "",
  className = "",
  widths = [null, 400, 800, 1280, 1920],
  baseFormat = "jpeg",
  optimalFormats = ["avif", "webp"],
  sizes = "100vw"
) => {
  console.log(path);
  const fullS3Path = `https://files.jameslittle.me/images/${path}`;

  const metadata = await Image(fullS3Path, {
    widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...widths],
    formats: [...optimalFormats, baseFormat],
    outputDir: "_site/images",
    urlPath: "/images",
    // dryRun: true,
  });

  const lowSrc = metadata[baseFormat][0];
  const highSrc = metadata[baseFormat][metadata[baseFormat].length - 1];

  return outdent`
    <picture class="lazy-picture" data-lazy-state="unseen">
    ${Object.values(metadata)
      .map((entry) => {
        return `<source type="${entry[0].sourceType}" srcset="${
          entry[0].srcset
        }" data-srcset="${entry
          .filter((imageObject) => imageObject.width !== 1)
          .map((filtered) => filtered.srcset)
          .join(", ")}" sizes="${sizes}" class="lazy">`;
      })
      .join("\n")}
    <img
      src="${lowSrc.url}"
      data-src="${highSrc.url}"
      width="${highSrc.width}"
      height="${highSrc.height}"
      alt="${alt}"
      class="lazy-img ${className}"
      loading="lazy">
    </picture>
    <noscript>
    <picture>
    ${Object.values(metadata)
      .map((entry) => {
        return `<source type="${entry[0].sourceType}" srcset="${entry
          .filter((imageObject) => imageObject.width !== 1)
          .map((filtered) => filtered.srcset)
          .join(", ")}" sizes="${sizes}">`;
      })
      .join("\n")}
    <img
      src="${highSrc.url}"
      width="${highSrc.width}"
      height="${highSrc.height}"
      alt="${alt}"
      class="${className}">
    </picture>
    </noscript>`;
};

module.exports = { imageShortcode };
