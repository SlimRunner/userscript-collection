// ==UserScript==
// @name        BookwalkerCoverThumbnailBlocker
// @namespace   slidav.Scripting
// @version     0.0.3
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
  const toggleClass = ":not(.sli-make-visible)";
  const dyanmicCards = [
    ".volume-card-module__XHaErG__root .volume-card-module__XHaErG__bookCoverContainer>.border-box-module__AueLUW__box",
  ];
  const customJoin = (sel, common, descendants) =>
    sel.map((e) => `${e}${common.join("")}${["", ...descendants].join("\n")}`);

  addStyleSheet(
    `\
    /* hide thumbs in episode lists */
    ${customJoin(dyanmicCards, [toggleClass], [contentClass])} {
      visibility: hidden;
    }

    ${customJoin(dyanmicCards, [toggleClass], [])} {
      background: rgba(255 255 255 / 25%);
    }
    `,
    true,
  );
  const observedClasses = customJoin(dyanmicCards, [], []);

  const buttonQuery = [
    ".volume-card-module__XHaErG__content",
    ".stack-module__28jnBG__stack.volume-card-module__XHaErG__actionOrStatus",
  ].join(" ");
  const viewEnabler = () => {
    const episodeCards = document.querySelectorAll(observedClasses);
    episodeCards.forEach((el) => {
      const btnCont = el.parentElement.parentElement;
      const isRead = /\bread\b/i.test(
        btnCont.querySelector(buttonQuery).textContent.trim(),
      );
      console.log(isRead);
      if (isRead) {
        el.classList.add("sli-make-visible");
      } else if (!isRead) {
        el.classList.remove("sli-make-visible");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    viewEnabler();
  })

  let pageInterval = null;
  const seriesURL = /(?<=bookwalker.com\/)series$/;
  const mtconfig = { childList: true, subtree: true };
  const enableViewInterval = (mutList, obs) => {
    const pageMatches = seriesURL.test(location.href);
    if (pageMatches && pageInterval === null) {
      pageInterval = setInterval(viewEnabler, 500);
    } else if (!pageMatches && pageInterval !== null) {
      clearInterval(pageInterval);
      pageInterval = null;
    }
  };

  const pgObs = new MutationObserver(enableViewInterval);
  pgObs.observe(document, mtconfig);

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
