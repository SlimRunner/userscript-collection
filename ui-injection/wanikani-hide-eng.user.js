// ==UserScript==
// @name        WanikaniENGBlur
// @namespace   slidav.Scripting
// @version     0.0.3
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
    .context-sentences .wk-text:not([lang]),
    .subject-character-grid__item .subject-character__content .subject-character__info .subject-character__reading,
    .subject-character-grid__item .subject-character__content .subject-character__info .subject-character__meaning {
      filter: blur(5px);
      transition: filter 0.25s ease;
    }

    .context-sentences .wk-text:hover,
    .subject-character-grid__item .subject-character__content:hover .subject-character__info .subject-character__reading,
    .subject-character-grid__item .subject-character__content:hover .subject-character__info .subject-character__meaning {
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
