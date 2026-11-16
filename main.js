import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import { defineCustomElements } from "@ionic/core/loader";

defineCustomElements();

for (const id of ["first", "second"]) {
  document.getElementById(id).breakpoints = [0, 0.5, 1];
}

document.getElementById("both").addEventListener("click", () => {
  document.getElementById("first").present(); // not awaited
  document.getElementById("second").present();
});

// ?guard=1 adds the workaround: stop focus events for a modal that lost focus
if (new URLSearchParams(location.search).has("guard")) {
  document.documentElement.addEventListener(
    "focus",
    (e) => {
      if (e.target.tagName === "ION-MODAL" && document.activeElement !== e.target)
        e.stopPropagation();
    },
    true,
  );
}
