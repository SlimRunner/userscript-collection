// ==UserScript==
// @name        BookwalkerCoverThumbnailBlocker
// @namespace   slidav.Scripting
// @version     0.4.1
// @author      SlimRunner
// @description Hides thumbnails of non-read books in bookwalker
// @grant       none
// @match       https://bookwalker.com/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// ==/UserScript==

(function () {
  "use strict";
  const excludedPaths = new Set(["/"]);
  const cssID = "thumb-conceal";

  applyStyles();

  // *********************************************
  // this block was created by AI
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };

  window.addEventListener("popstate", applyStyles);
  window.addEventListener("locationchange", applyStyles);
  // *********************************************

  function applyStyles() {
    const styleSheet = document.getElementById(cssID);

    if (excludedPaths.has(window.location.pathname)) {
      if (styleSheet) styleSheet.remove();
      return;
    }

    if (styleSheet) return;

    const imgSelector = ">source+source+img";
    const baseSelectors = ["a div div picture.dKTvOq_cover"];
    const customJoin = (sel, common, pseudo = "") =>
      sel.map((e) => `${e}${common.join("")}${pseudo}`).join(",\n");

    addStyleSheet(
      `\
      /* hide thumbs in episode lists */
      ${customJoin(baseSelectors, [imgSelector])} {
        opacity: 0;
        transition: opacity 0.25s ease; 
      }

      ${customJoin(baseSelectors, [imgSelector], ":hover")} {
        opacity: 1;
      }

      ${customJoin(baseSelectors, [])} {
        background: rgba(255 255 255 / 15%);
      }
      `,
      true,
    );
  }

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
    style.id = cssID;
    document.head.append(style);
    return style;
  }
})();
