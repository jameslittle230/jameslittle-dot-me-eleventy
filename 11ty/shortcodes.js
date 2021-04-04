exports.bigTitle = (title, metadata = null) => {
  let out = "";
  if (metadata) {
    out += `<p class="metadata">${metadata}</p>`;
  }
  out += `<h1 class="big-title">${title}</h1>`;
  return out;
};
