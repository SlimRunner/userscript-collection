// ==UserScript==
// @name        CrunchyEpThumbnailBlocker
// @namespace   slidav.Scripting
// @version     0.1.0
// @author      SlimRunner (David Flores)
// @description Hides thumbnails of non-watched episodes in Crunchyroll
// @grant       none
// @match       https://www.crunchyroll.com/*
// ==/UserScript==

(function () {
  "use strict";
  const contentClass = ".content-image--3na7E";
  const toggleClass = ":not(.sli-make-visible)";
  const dyanmicCards = [
    ".erc-up-next-section .playable-thumbnail--HKMt2",
    ".erc-watch-more-episodes a.playable-card-mini-static__thumbnail-wrapper--kGEEH",
    ".episode-list .card .playable-card__thumbnail-wrapper--BkWZo",
    ".erc-history-collection .playable-card__thumbnail-wrapper--BkWZo",
  ];
  const customJoin = (sel, common, descendants) =>
    sel.map((e) => `${e}${common.join("")}${["", ...descendants].join("\n")}`);

  const rules = `
  /* hide thumbs in episode lists */
  ${customJoin(dyanmicCards, [toggleClass], [contentClass])} {
    visibility: hidden;
  }
  ${customJoin(dyanmicCards, [toggleClass], [])} {
    background: rgba(255 255 255 / 25%);
  }`.replace(/^ {2}/, "");

  const style = document.createElement("style");
  style.textContent = rules;
  document.head.append(style);
  const observedClasses = customJoin(dyanmicCards, [], []);

  const viewEnabler = () => {
    const episodeCards = document.querySelectorAll(observedClasses);
    episodeCards.forEach((el) => {
      const isWatched = /\bwatched\b|\b\d+\w+ left\b/i.test(
        el.querySelector("div.text--gq6o-").textContent
      );
      if (isWatched && el.style.visibility !== "visible") {
        el.classList.add("sli-make-visible");
      } else if (!isWatched && el.style.visibility !== "") {
        el.classList.remove("sli-make-visible");
      }
    });
  };

  let pageInterval = null;
  const seriesURL = /(?<=crunchyroll.com\/)series|crunchyroll.com\/?$/;
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
})();
