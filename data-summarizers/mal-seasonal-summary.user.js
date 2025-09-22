// ==UserScript==
// @name        mal-stat-season-stats
// @namespace   slidav.myanimelist
// @version     0.0.3
// @author      SlimRunner
// @description Aggregates anime metadata counts
// @grant       none
// @match       https://myanimelist.net/anime/season/*
// @match       https://myanimelist.net/manga/season/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-seasonal-summary.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/data-summarizers/mal-seasonal-summary.user.js
// ==/UserScript==

(function () {
  "use strict";
  const targets = document.querySelectorAll(".js-seasonal-anime");
  const entries = Array.from(targets).filter((e) => e.style.display !== "none");

  const caps = new Set(["studio", "themes", "demographic", "source"]);
  const mappings = new Map();

  entries.forEach((e) => {
    const props = e.querySelectorAll(".synopsis .properties .property");

    for (const prop of props) {
      const propElem = prop.querySelector(".caption");
      const itemElems = prop.querySelectorAll(".caption~.item");

      if (propElem !== null && caps.has(propElem.textContent.toLowerCase())) {
        const capTitle = propElem.textContent.toLowerCase();
        const newKey = addOrGetItem(mappings, capTitle, new Map());

        Array.from(itemElems).map((e) => {
          addOrGetItem(newKey, e.textContent, 0, (m, k) =>
            m.set(k, m.get(k) + 1)
          );
        });
      }
    }
  });

  const getText = (category, pairs) =>
    Array.from(pairs.get(category))
      .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
      .join("\n");
  window.malSeason = { mappings, getText };

  function addOrGetItem(map, key, def = undefined, funct = (m, k) => m.get(k)) {
    if (!(map instanceof Map)) {
      throw TypeError("expected 'map' to be map");
    }

    if (!map.has(key)) {
      map.set(key, def);
    }

    return funct(map, key);
  }
})();
