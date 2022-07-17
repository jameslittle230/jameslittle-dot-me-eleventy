function hideIsoDate() {
  const timestamps = document.querySelectorAll(".timestamp");
  timestamps.forEach((ts) => {
    const absolute = ts.querySelector(".absolute");
    if (absolute) {
      ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
      ts.addEventListener("mouseenter", () => {
        ts.style.transform = `translateX(0)`;
      });
      ts.addEventListener("mouseleave", () => {
        ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
      });
    }
  });
}

hideIsoDate();
