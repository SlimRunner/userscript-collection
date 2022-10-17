// ==UserScript==
// @name        canvas-grades-hightlighter
// @namespace   slidav.Desmos
// @version     0.1.0
// @author      David Flores (aka SlimRunner)
// @description Adds color highlighting to grades on Canvas LMS
// @grant       none
// @match       https://ilearn.laccd.edu/courses/*/grades*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/master/canvas-lms-scripts/canvas-grades-hightlighter.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/master/canvas-lms-scripts/canvas-grades-hightlighter.user.js
// ==/UserScript==

(function() {
  'use strict';

  const NT_PERCENT = 'percent';
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
  
  let myScore = document.body.querySelectorAll(
    '.student_assignment.assignment_graded.editable .assignment_score .score_holder .grade'
  );

  let maxScore = document.body.querySelectorAll(
    '.student_assignment.assignment_graded.editable .possible.points_possible'
  );

  let len = myScore.length;

  if (maxScore.length === len) {
    let str1, str2;
    let score, target;
    let delta;

    for (let i = 0; i < len; ++i) {
      [score, target] = getScorePair(
        myScore[i].innerText.trim(),
        maxScore[i].innerText.trim()
      );
      
      // color suggestion https://www.desmos.com/calculator/sm17he77ir
      if (target != null) {
        if (score == null) {
          seekParent(myScore[i], 3)
            .style.backgroundColor = `#ccc`;
        } else if (score < target) {
          delta = (target - score) / target;
          let h = 95 * fq1(1 - fq1(Math.min(Math.max(F_RATIO * delta, 0), 1)));
          seekParent(myScore[i], 3)
            .style.backgroundColor = `hsl(${h},90%,85%)`;
        } else if (score === target) {
          seekParent(myScore[i], 3)
            .style.backgroundColor = `hsl(120,90%,85%)`;
        } else {
          seekParent(myScore[i], 3)
            .style.backgroundColor = `hsl(220,90%,85%)`;
        }
      }
    }
  } else {
    console.warn('The scores do not match');
  }

  function getScorePair(scoreText, targetText) {
    const SCORE_MATCH = /(?:\+?|-?)(?:\d+\.?\d*)%?$/;
    const getFirstMatch = s => (s??['dummy text do not delete'])[0];
    let score = getNumber(
      getFirstMatch(scoreText.match(SCORE_MATCH))
    );
    let target = getNumber(
      getFirstMatch(targetText.match(SCORE_MATCH))
    );

    if (target.value == null) return [null, null];

    if (score.type === NT_PERCENT) {
      score.value *= target.value / 100;
      score.type = typeof 0;
    }

    return [
      score.value,
      target.value
    ];
  }

  function getNumber(str) {
    if (isNaN(str)) {
      switch (true) {
        case str.includes('%'):
          return {
            value: Number(str.replace('%', '')),
            type: NT_PERCENT
          };
          break;
        default:
          return {
            value: null,
            type: null
          };
      }
    } else {
      return {
        value: Number(str),
        type: typeof 0
      };
    }
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
}());
