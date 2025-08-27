// ==UserScript==
// @name        mal-stat-summarizer
// @namespace   slidav.gradescope
// @version     0.2.2
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
  const stats = {
    total: null,
    mean: null,
    stdev: null,
    mode: null,
    median: null,
    peaks: null,
  };
  const entryURL = document.URL.replace(/\/stats$/, "");

  const ratingsTotal = ratings.reduce((x, {rate: r, freq: v}) => x + v, 0);
  const ratingsMean = ratings.reduce((x, {rate: r, freq: v}) => x + r * v / ratingsTotal, 0);
  const ratingsStDev = Math.sqrt(ratings.reduce((x, {rate: r, freq: v}) => x + (r - ratingsMean) ** 2 * v / ratingsTotal, 0));
  const ratingsPeaks =  getPeaks(ratings, { comparator: (a, b) => a.freq - b.freq });
  const ratingsMode = ratings.reduce((x, {rate: r, freq: v}) => (v <= x.freq ? x : {rate: r, freq: v}));
  const ratingsMedian = getMedian(ratings, {
    getValue: x => x.rate,
    getFreq: x => x.freq,
    meanFn: (a, b) => (a.rate + b.rate) / 2
  });
  stats.total = ratingsTotal;
  stats.mean = ratingsMean;
  stats.stdev = ratingsStDev;
  stats.mode = ratingsMode;
  stats.median = ratingsMedian;
  stats.peaks = ratingsPeaks;

  const dropRate = summary.dropped / (summary.dropped + summary.completed + summary.watching);
  const abandonmentRate = (summary.dropped + summary.onHold) / (summary.dropped + summary.completed + summary.watching + summary.onHold);
  const completionRate = summary.completed / (summary.dropped + summary.completed + summary.watching + summary.onHold);
  const engagementRate = (summary.watching + summary.completed) / summary.total;

  console.table({
    ratingsTotal,
    ratingsMean: Math.round(ratingsMean * 100) / 100,
    ratingsStDev: Math.round(ratingsStDev * 100) / 100,
    ratingsMode: ratingsMode.rate,
    ratingsMedian: ratingsMedian.rate,
    ratingsPeaks: ratingsPeaks.map(e => e.rate).join(", "),
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
    stats,
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
        .map((e, i) => ({
          rate: 10 - i,
          freq: parseInt(e),
        }));
      result = rawNumbers;
    }

    return result;
  }

  function getMedian(binnedDataset, {
    getValue = (x) => x,
    getFreq = (x) => x,
    comparator = (a ,b) => a - b,
    meanFn = (a, b) => (a + b) / 2,
  } = { }) {
    const sortedSet = [...binnedDataset].sort((a, b) => comparator(getValue(a), getValue(b)));

    const sampleSize = sortedSet.reduce((acc, x) => acc + getFreq(x), 0);
    const midPoint = Math.floor(sampleSize / 2);

    let cumulative = 0;
    let prevBin = null;

    for (const bin of binnedDataset) {
      const value = getValue(bin);
      const freq = getFreq(bin);

      if (cumulative + freq > midPoint) {
        if (sampleSize % 2 === 1) {
          return bin;

        } else {
          if (cumulative === midPoint) {
            return meanFn(prevBin, bin);

          } else {
            return bin;

          }
        }
      }

      cumulative += freq;
      prevBin = bin;
    }

    throw Error("Uncaught error in getMedian");
  }

  function getPeaks(binnedDataset, {
    comparator = (a ,b) => a - b,
  } = { }) {
    const leq = (a, b) => comparator(a, b) <= 0
    const stack = [];
    // let buffer = null;
    let state = 0;

    for (const freq of binnedDataset) {
      switch (state) {
        case 0: // starting state
          stack.push(freq);
          state = 1;
          break;

        case 1: // raising edge
          if (leq(freq, stack.at(-1))) {
            stack.push(freq);
            state = 2;
          } else {
            stack[stack.length - 1] = freq;
            state = 1;
          }
          break;

        case 2: // falling edge
          if (leq(freq, stack.at(-1))) {
            stack[stack.length - 1] = freq
            state = 2;
          } else {
            stack[stack.length - 1] = freq;
            state = 1;
          }
          break;
      }
    }

    if (state !== 1) {
      stack.pop();
    }

    return stack;
  }
})();
