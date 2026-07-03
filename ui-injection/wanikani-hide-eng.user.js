// ==UserScript==
// @name        WanikaniENGBlur
// @namespace   slidav.Scripting
// @version     0.0.2
// @author      SlimRunner (David Flores)
// @description Hides English translations in Wanikani
// @grant       none
// @match       https://www.wanikani.com/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/wanikani-hide-eng.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/wanikani-hide-eng.user.js
// ==/UserScript==

(function () {
  "use strict";

  addStyleSheet(
    `\
    .context-sentences .wk-text:not([lang]) {
      filter: blur(5px);
    }

    .context-sentences .wk-text:hover {
      filter: blur(0);
    }
    `,
    true,
  );

  function addStyleSheet(rules, dedent = false) {
    if (dedent) {
      const TAB = /^\t/.test(rules) ? "\t" : " ";
      const tabBase = rules
        .match(new RegExp(String.raw`^${TAB}+(?!\n$)`, "gm"))
        .reduce((acc, curr) => Math.min(acc, curr.length), Infinity);
      let tab = "";
      for (let i = 0; i < tabBase; ++i) {
        tab += " ";
      }
      rules = rules.replaceAll(new RegExp(`^${TAB}{${tabBase}}`, "gm"), "");
    }
    const style = document.createElement("style");
    style.textContent = rules;
    document.head.append(style);
    return style;
  }
})();
