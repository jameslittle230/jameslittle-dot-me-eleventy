lf = new BareFoot();
lf.init();

let figures = document.querySelectorAll("img");
for (let figure of figures) {
  figure.addEventListener("click", flipFigure);
}

function flipFigure(ev) {
  let el = ev.target;
  let before = el.getBoundingClientRect();
  el.classList.toggle("enlarged");
  let after = el.getBoundingClientRect();

  let transitioningToEnlarged = el.classList.contains("enlarged");

  const deltaX = before.left - after.left;
  const deltaY = before.top - after.top;
  const deltaW = before.width / after.width;
  const deltaH = before.height / after.height;

  let sib = el.nextElementSibling;
  let parent = el.parentElement;
  while (!sib && parent) {
    sib = parent.nextElementSibling;
    parent = parent.parentElement;
  }

  if (sib) {
    sib.style.paddingTop = transitioningToEnlarged
      ? `calc(${before.height}px + 1.5em)` // 1.5em = article > * {margin-bottom}, in post.css
      : "0px";
  }

  let scrim = document.getElementById("scrim");
  
  let animationOptions = {
    duration: 400,
    easing: "ease-out",
    fill: "both",
  };

  if (scrim) {
    let enlargedOpacityValue = "0.8";
    let noEnlargedOpacityValue = "0"
    scrim.animate(
      [
        {
          opacity: transitioningToEnlarged ? noEnlargedOpacityValue : enlargedOpacityValue,
        },
        {
          opacity: transitioningToEnlarged ? enlargedOpacityValue : noEnlargedOpacityValue,
        },
      ],
      animationOptions
    );
  }

  el.animate(
    [
      {
        transformOrigin: "top left",
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`,
      },
      {
        transformOrigin: "top left",
        transform: "none",
      },
    ],
    animationOptions
  );
}
