// ==UserScript==
// @name        mal-stat-summarizer
// @namespace   slidav.gradescope
// @version     0.1.1
// @author      SlimRunner
// @description Computes useful ratios out of an entry stats.
// @grant       none
// @match       https://myanimelist.net/anime/*/stats
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-stats-cruncher.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-stats-cruncher.user.js
// ==/UserScript==

(function () {
  "use strict";
  // --
  const title = getTitle();
  const summary = getSummary();
  const ratings = getRatings();
  const entryURL = document.URL.replace(/\/stats$/, "");

  const ratingsTotal = ratings.reduce((x, [r, v]) => x + v, 0);
  const ratingsMean = ratings.reduce((x, [r, v]) => x + r * v / ratingsTotal, 0);
  const ratingsStDev = Math.sqrt(ratings.reduce((x, [r, v]) => x + (r - ratingsMean) ** 2 * v / ratingsTotal, 0));

  const dropRate = summary.dropped / (summary.dropped + summary.completed + summary.watching);
  const abandonmentRate = (summary.dropped + summary.onHold) / (summary.dropped + summary.completed + summary.watching + summary.onHold);
  const completionRate = summary.completed / (summary.dropped + summary.completed + summary.watching + summary.onHold);
  const engagementRate = (summary.watching + summary.completed) / summary.total;

  console.table({
    ratingsTotal,
    ratingsMean,
    ratingsStDev,
  });

  console.table({
    dropRate: Math.round(10000 * dropRate) / 100,
    abandonmentRate: Math.round(10000 * abandonmentRate) / 100,
    completionRate: Math.round(10000 * completionRate) / 100,
    engagementRate: Math.round(10000 * engagementRate) / 100,
  });

  const inlineMessage = [title]
  inlineMessage.push(Math.round(10000 * dropRate) / 100);
  inlineMessage.push(Math.round(10000 * abandonmentRate) / 100);
  inlineMessage.push(Math.round(10000 * completionRate) / 100);
  inlineMessage.push(Math.round(10000 * engagementRate) / 100);
  inlineMessage.push(entryURL);

  const inlineEntry = inlineMessage.join("\n");

  console.log(inlineEntry);

  window.malStats = {
    summary,
    ratings,
    inlineEntry,
  }

  function getTitle() {
    const elements = document.querySelector(".title-name");
    let result = null;

    if (elements != null) {
      result = elements.textContent.trim();
    }

    return result;
  }

  function getSummary() {
    const elements = Array.from(document.querySelectorAll("#summary_stats~div"));
    let result = null;

    if (elements.length >= 6) {
      elements.splice(6);
      // broken down into multiple maps to improve readability
      const rawNumbers = elements
        .map(e => e.textContent.replaceAll(",", ""))
        .map(e => e.match(/\d+/).at(0))
        .map(e => parseInt(e));
      result = {
        watching: rawNumbers[0],
        completed: rawNumbers[1],
        onHold: rawNumbers[2],
        dropped: rawNumbers[3],
        planToWatch: rawNumbers[4],
        total: rawNumbers[5],
      }
    }

    return result;
  }

  function getRatings() {
    const elements = Array.from(document.querySelectorAll("#score_stats+.score-stats tr"));
    let result = null;

    if (elements.length === 10) {
      // broken down into multiple maps to improve readability
      const rawNumbers = elements
        .map(e => e.textContent.trim())
        .map(e => e.match(/(?<=\()\s*\d+\s*(?=votes\))/).at(0))
        .map((e, i) => [10 - i, parseInt(e)]);
      result = rawNumbers;
    }

    return result;
  }
})();
