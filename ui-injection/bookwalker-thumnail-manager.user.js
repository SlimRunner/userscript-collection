// ==UserScript==
// @name        BookwalkerCoverThumbnailBlocker
// @namespace   slidav.Scripting
// @version     0.0.11
// @author      SlimRunner
// @description Hides thumbnails of non-read books in bookwalker
// @grant       none
// @match       https://bookwalker.com/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// ==/UserScript==

(function () {
  "use strict";
  const contentClass = ".image-module__6V_xxW__picture";
  const toggleClass = "";
  const dyanmicCards = [
    ".stack-module__28jnBG__stack .book-detail-page-module__-_bpFq__volumeCards a>.border-box-module__AueLUW__box",
    ".stack-module__28jnBG__stack.stack-module__28jnBG__stack .cart-page-module__2DyzQG__group>.group-module__n4_Xda__group>a",
    ".stack-module__28jnBG__stack.stack-module__28jnBG__stack .checkout-complete-page-module__Nxdpqa__bookGrid>.book-card-frame-module__MeOSPq__root>a",
  ];
  const customJoin = (sel, common, descendants, pseudo = "") =>
    sel
      .map(
        (e) =>
          `${e}${common.join("")}${["", ...descendants].join(" ")}${pseudo}`,
      )
      .join(",\n");

  addStyleSheet(
    `\
    /* hide thumbs in episode lists */
    ${customJoin(dyanmicCards, [], [contentClass])} {
      opacity: 0;
      transition: opacity 0.25s ease; 
    }

    ${customJoin(dyanmicCards, [], [contentClass], ":hover")} {
      opacity: 1;
    }

    ${customJoin(dyanmicCards, [], [])} {
      background: rgba(255 255 255 / 25%);
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
