// ==UserScript==
// @name        mal-ep-data-norm
// @namespace   slidav.Scripting
// @version     0.0.2
// @author      SlimRunner (David Flores)
// @description Processes episode time data into normalized timestamps
// @grant       none
// @match       https://myanimelist.net/ajaxtb.php?keepThis=true&detailedaid=*
// @match       https://myanimelist.net/ajaxtb.php?keepThis=true&detailedmid=*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-ep-data-normalizer.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-ep-data-normalizer.user.js
// ==/UserScript==

(function () {
  "use strict";
  const title = document
    .querySelector("form #epdetails #eplayer .normal_header")
    .textContent.trim();
  const rawData = Array.from(
    document.querySelectorAll("form #epdetails #eplayer .spaceit_pad"),
  )
    .map((e) => e.textContent.trim())
    .toReversed();

  const siteURL = document.URL;
  const resTag = siteURL.match(/detailed[am]id=/g);
  if (resTag == null || resTag.length < 1) {
    throw Error("Expected at least one match in URL for Manga or Anime types");
  }
  let resType = resTag[0];
  let pattern = new RegExp();

  switch (resType) {
    case "detailedaid=": // anime
      pattern =
        /Ep (\d+), watched on (\d{2})\/(\d{2})\/(\d{4}) at (\d{2}):(\d{2})/;
      break;
    case "detailedmid=": // manga
      pattern =
        /Chapter (\d+), read on (\d{2})\/(\d{2})\/(\d{4}) at (\d{2}):(\d{2})/;
      break;
    default:
      throw Error("Expected either Manga or Anime types");
      break;
  }

  window.epData = Object.create(null);
  window.processData = processData;
  processData(rawData);

  function processData(rawData, name = null) {
    let maxEp = 0;
    const columnData = rawData.map((line) => {
      const [_, num, month, day, year, hour, minute] = line.match(pattern);
      const epNum = parseInt(num);
      maxEp = Math.max(maxEp, num.length);
      return { epNum, month, day, year, hour, minute };
    });

    const prettyData = columnData.map((e) => {
      const epNum = e.epNum.toString().padStart(maxEp, "0");
      return `- ${epNum} ${e.year}-${e.month}-${e.day}T${e.hour}:${e.minute}:00-07:00`;
    });
    const textQueue = columnData.map((e) => {
      return (
        `${e.year}-${e.month}-${e.day}T${e.hour}:${e.minute}:00-07:00` +
        `\t${e.day}.${e.month}.${e.year}`
      );
    });

    const commentWrap = (s) => "```\n" + s + "\n```";
    window.epData.title = name ?? title;
    window.epData.data = columnData;
    window.epData.getMarkdown = () => {
      return `## ${title}\n\n${prettyData.join("\n")}`;
    };
    window.epData.anidbQueue = () => {
      return `## ${title}\n\n${textQueue.join("\n")}`;
    };
  }
})();
