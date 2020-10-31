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

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("dark-mode-switch")
    .addEventListener("click", switchTheme);

  repaintButton();
});
