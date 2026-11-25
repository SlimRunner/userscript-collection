// ==UserScript==
// @name        BookwalkerCoverThumbnailBlocker
// @namespace   slidav.Scripting
// @version     0.5.2
// @author      SlimRunner
// @description Hides thumbnails of non-read books in bookwalker
// @grant       none
// @match       https://bookwalker.com/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/ui-injection/bookwalker-thumnail-manager.user.js
// ==/UserScript==

(function () {
  "use strict";
  const excludedPaths = ["/", "/library/collections/*", "/library/history"];
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

    if (
      excludedPaths.some((pattern) =>
        prefixMatch(window.location.pathname, pattern),
      )
    ) {
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

  /* tests
  console.table([
    prefixMatch("/", "/") === true,
    prefixMatch("/", "/a/b/c/d") === false,
    prefixMatch("/a/b/c", "/a/**") === true,
    prefixMatch("/a/b/c", "/a/b/**") === true,
    prefixMatch("/a/b", "/a/b/**") === false,
    prefixMatch("/a/b", "/a/b/*") === false,
    prefixMatch("/a/b/c", "/a/*") === false,
    prefixMatch("/a/b/c", "/a/b/*") === true,
    prefixMatch("/a/b/c", "/a/b/c") === true,
    prefixMatch("/a/b/c/d", "/a/b/c") === false,
    prefixMatch("/a/b/c", "/a/b/c/d") === false,
  ]);
  */

  /**
   *
   * @param {String} path
   * @param {String} pattern
   * @returns
   */
  function prefixMatch(path, pattern) {
    const pathParts = path.split("/").filter(Boolean);
    const patternParts = pattern.split("/").filter(Boolean);

    let partsMatch = true;
    let lenMatches = patternParts.length === pathParts.length;
    for (let i = 0; partsMatch && i < patternParts.length; i++) {
      const part = patternParts[i];
      if (partsMatch && part === "**") {
        lenMatches = i + 1 <= pathParts.length;
        break;
      }
      partsMatch =
        partsMatch &&
        i < pathParts.length &&
        (part === "*" || part === pathParts[i]);
      lenMatches = i + 1 === pathParts.length;
    }

    return partsMatch && lenMatches;
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
