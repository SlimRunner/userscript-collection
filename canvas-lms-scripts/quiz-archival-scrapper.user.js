// ==UserScript==
// @name        canvas-grades-hightlighter
// @namespace   slidav.Canvas
// @version     0.0.2
// @author      David Flores (aka SlimRunner)
// @description Captures questions for archival purposes
// @grant       none
// @match       https://*.edu/courses/*/assignments/*/sumissions*
// @downloadURL https://github.com/SlimRunner/userscript-collection/raw/main/canvas-lms-scripts/quiz-archival-scrapper.user.js
// @updateURL   https://github.com/SlimRunner/userscript-collection/raw/main/canvas-lms-scripts/quiz-archival-scrapper.user.js
// ==/UserScript==

(function() {
  'use strict';
  const getItems = () => {
    const objs = collectObjects();
    const textNodes = objs.map(o => {
      const result = {};
      ["name", "score", "question", "answers", "other"].forEach(key => {
        if (Symbol.iterator in o[key]) {
          result[key] = Array.from(o[key]).map(e => e.textContent.trim());
        } else {
          result[key] = o[key].textContent.trim();
        }
      });
      return result;
    });
    return textNodes;
  }

  window.getItems = getItems;
  window.formatAsTex = formatAsTex;

  function isLive() {
    return !document.querySelector(".submission_details");
  }

  function getQueries() {
    if (isLive()) {
      return {
        isLive: true,
        iframe: null,
        quizItems: "",
        questionName: "",
        questionScore: "",
        questionText: "",
        answerItems: "",
        answerText: "",
        otherText: "",
      };
    } else {
      return {
        isLive: false,
        iframe: "iframe#preview_frame",
        quizItems: ".quiz-submission #questions .question_holder .display_question",
        questionName: ".name.question_name",
        questionScore: ".user_points",
        questionText: ".question_text",
        answerItems: ".answers",
        answerText: ".answer .answer_text",
        otherText: ".after_answers",
      };
    }
  }

  function queryAllOrError(element, query) {
    // if (element instanceof Docu) {
      const nodes = element.querySelectorAll(query);
      if (nodes.length === 0) {
        throw new RangeError(`The query failed.`);
      }
      return nodes;
    // } else {
    //   console.log(element);
    //   throw new TypeError("Expected an element");
    // }
  }

  function queryOrError(element, query, atMost = 0, pick = 0) {
    // if (element instanceof HTMLElement) {
      let result = null;
      if (atMost <= 0) {
        result = element.querySelector(query);
      } else {
        const nodes = element.querySelectorAll(query);
        if (nodes.length > atMost) {
          throw new TypeError(`Found ${nodes.length}. Expected ${atMost}`);
        }
        if (pick >= nodes.length) {
          throw new RangeError(`Picked item is out of bounds. ${pick} >= ${nodes.length} ${query}`);
        }
        result = nodes.length === 0 ? null : nodes[pick];
      }
      if (result === null) {
        throw new TypeError(`The query failed.`);
      } else if (!(result instanceof Element)) {
        // throw new TypeError("The query returned a non-element.");
      }
      return result;
    // } else {
    //   console.log(element);
    //   throw new TypeError("Expected an element");
    // }
  }

  function collectObjects() {
    const queries = getQueries();
    let objects;

    if (queries.isLive) {
      // nothing to do yet
      throw new Error("not implemented yet");
    } else {
      const iframe = queryOrError(document.body, queries.iframe);
      if (!(iframe instanceof HTMLIFrameElement)) {
        throw new Error("iFrame query failed");
      }
      const quizDoc = iframe.contentWindow.document.body;
      const items = Array.from(queryAllOrError(quizDoc, queries.quizItems));
      objects = items.map(item => {
        return {
          name: queryOrError(item, queries.questionName, 1),
          score: queryOrError(item, queries.questionScore, 1),
          question: queryAllOrError(item, queries.questionText),
          answers: queryAllOrError(item, queries.answerText),
          other: queryAllOrError(item, queries.otherText),
        };
      })
    }
    return objects;
  }

  function formatAsTex(quiz) {
    // this function is specific for a compressed TEX file
    const result = quiz.map(q => {
      // ["name", "score", "question", "answers", "other"]
      const partial = [];
      partial.push(`\\item ${q.question[0]}`);
      partial.push("\\begin{itemize}[itemsep=0em]");
      q.answers.forEach(a => {
        partial.push(`\\item ${a}`);
      });
      partial.push("\\end{itemize}");
      return partial.join("\n");
    })
    return result.join("\n");
  }
}());
