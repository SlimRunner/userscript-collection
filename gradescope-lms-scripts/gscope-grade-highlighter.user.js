// ==UserScript==
// @name        gscope-grades-hightlighter
// @namespace   slidav.gradescope
// @version     0.0.1
// @author      David Flores (aka SlimRunner)
// @description Adds color highlighting to grades on GradeScope LMS
// @grant       none
// @match       https://www.gradescope.com/courses/*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/gradescope-lms-scripts/gscope-grade-highlighter.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/gradescope-lms-scripts/gscope-grade-highlighter.user.js
// ==/UserScript==

(function () {
  "use strict";

  const Ntype = Object.freeze({
    ERROR: 0,
    NUMBER: 1,
    PERCENT: 2,
  });
  const F_RATIO = 5 / 2;

  const querp = (a, b, c, t) => {
    let tinv = 1 - t;
    return tinv * tinv * a + 2 * tinv * t * b + t * t * c;
  };

  const invQuerp = (a, b, c, tinv) => {
    if (a + c === 2 * b) {
      if (b === a) {
        return tinv - a;
      } else {
        return (tinv - a) / (b - a);
      }
    } else {
      let sqTerm = a - 2 * b + c;
      return (a - b + Math.sqrt(b * b - a * c + tinv * sqTerm)) / sqTerm;
    }
  };

  const fq1 = (x) => querp(0, 0.5, 1, invQuerp(0, 0, 1, x));

  const scoreElems = Array.from(
    document.querySelectorAll(".submissionStatus--score")
  );
  const modules = scoreElems.map((e) => {
    let [score, target, ..._] = e.textContent.split("/").map((e) => e.trim());
    return {
      score: parseScore(score),
      target: parseScore(target),
      container: seekParent(e, 1),
    };
  });

  // color suggestion https://www.desmos.com/calculator/sm17he77ir
  for (const unit of modules) {
    let [score, target, isValid] = parsePair(unit.score, unit.target);
    let colorGrading = "";
    if (!isValid) {
      colorGrading = `#ccc`;
    } else if (score < target) {
      let delta = (target - score) / target;
      let h = 95 * fq1(1 - fq1(Math.min(Math.max(F_RATIO * delta, 0), 1)));
      colorGrading = `hsl(${h},90%,85%)`;
    } else if (score === target) {
      colorGrading = `hsl(120,90%,85%)`;
    } else {
      colorGrading = `hsl(220,90%,85%)`;
    }
    if (unit.container ?? false) {
      unit.container.style.backgroundColor = colorGrading;
      unit.container.style.borderRadius = "10px";
    }
  }

  function parsePair(x, y) {
    switch (true) {
      case x.type === Ntype.PERCENT:
        return [x.value, 100, true];
      case x.type === Ntype.NUMBER && y.type === Ntype.NUMBER:
        return [x.value, y.value, true];
      case x.type === Ntype.ERROR:
        return [NaN, NaN, false];
      default:
        return [NaN, NaN, false];
    }
  }

  function parseScore(n) {
    let ispercent = (n.match(/(\d+)%/) ?? [false]).pop();
    if (ispercent) {
      return {
        type: Ntype.PERCENT,
        value: parseFloat(ispercent),
      };
    } else {
      let np = parseFloat(n);
      if (!isNaN(np)) {
        return {
          type: Ntype.NUMBER,
          value: np,
        };
      }
    }
    return {
      type: Ntype.ERROR,
      value: NaN,
    };
  }

  function seekParent(src, level) {
    if (level <= 0) return src;

    for (var i = 0; i < level; ++i) {
      if (src != null) {
        src = src.parentElement;
      } else {
        return null;
      }
    }

    return src;
  }
})();
