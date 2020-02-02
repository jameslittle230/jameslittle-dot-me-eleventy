exports.img = function img(r, urlbase, classList, style) {
    var ratio = r;
    var classList = classList;
    var style = style;
    var urlbase = urlbase;

    console.log(typeof r);

    if(typeof r == "object") {
        urlbase = r.urlbase;
        classList = r.classList;
        style = r.style
        ratio = r.ratio
    }

    console.log(ratio, urlbase, classList, style);

    return `<div style="${style || ""}" class="${classList || ""}">
    <div class="picture-placeholder" style="padding-top: ${ratio}"></div>
    <picture class="over-placeholder">
        <source type="image/webp" srcset="${urlbase}.webp">
        <source type="image/jpeg" srcset="${urlbase}.jpg">
        <img src="${urlbase}.jpg" alt="">
    </picture>
    </div>`;
}