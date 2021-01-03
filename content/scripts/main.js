var jlGlobals = {};
function recomputeComputedValue() {
  const storedSetting = localStorage.getItem("theme");
  const osThemeIsDark = window.matchMedia("(prefers-color-scheme: dark)")
    .matches;

  /*
  Light by default
  Dark if stored setting is null and OS is in dark mode
  Whatever stored setting is if it exists

                        | os dark       os light
    ----------------------------------------------
    stored setting dark  | dark          dark
    ----------------------------------------------
    stored setting light | light         light
    ----------------------------------------------
    stored setting null  | dark          light

  */

  jlGlobals.theme = storedSetting
    ? storedSetting
    : osThemeIsDark
    ? "dark"
    : "light";
  if (["light", "dark"].indexOf(jlGlobals.theme) === -1) {
    console.error("Could not determine theme");
    /* Log */
    jlGlobals.theme = "light";
  }

  document.documentElement.setAttribute("data-theme", jlGlobals.theme);
}

recomputeComputedValue();

function repaintButton() {
  switch (jlGlobals.theme) {
    case "light":
      document.getElementById("dark-text").style.display = "none";
      document.getElementById("light-text").style.display = "inline";
      break;
    case "dark":
      document.getElementById("light-text").style.display = "none";
      document.getElementById("dark-text").style.display = "inline";
      break;
  }
}

function switchTheme() {
  switch (jlGlobals.theme) {
    case "light":
      localStorage.setItem("theme", "dark");
      break;
    case "dark":
      localStorage.setItem("theme", "light");
      break;
  }

  recomputeComputedValue();
  repaintButton();
}

function toggleTopbarNavVisibility() {
  const e = document.getElementById("linked-list");
  if (e.style.display === "flex") {
    e.style.display = null; // reset to default; "none" in stylesheet
    document.getElementById("topbar-caret").innerHTML = "&darr;";
  } else {
    e.style.display = "flex";
    document.getElementById("topbar-caret").innerHTML = "&uarr;";
  }
  console.log(e.style.display);
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("dark-mode-switch")
    .addEventListener("click", switchTheme);

  document
    .getElementById("topbar-caret")
    .addEventListener("click", toggleTopbarNavVisibility);

  repaintButton();

  document.querySelector("#search-toggle").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#search-toggle-target").classList.toggle("zoop");
    if (
      document.querySelector("#search-toggle-target").classList.contains("zoop")
    ) {
      document.querySelector("#stork-input").focus();
    }
  });

  document
    .querySelector("#search-toggle-close")
    .addEventListener("click", (e) => {
      e.preventDefault();
      const input = document.querySelector("#stork-input");
      input.value = "";
      input.dispatchEvent(new KeyboardEvent("keypress", { key: "a" }));
      document.querySelector("#search-toggle-target").classList.remove("zoop");
    });
});
