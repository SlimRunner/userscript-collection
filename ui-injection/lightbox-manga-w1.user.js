// ==UserScript==
// @name        NoragamiMangaLightbox
// @namespace   slidav.Scripting
// @version     0.0.4
// @author      SlimRunner (David Flores)
// @description Adds a nice lightbox navigation to the page
// @grant       none
// @match       https://w1.noragamimanga.online/manga/noragami-chapter*
// ==/UserScript==

(function () {
  "use strict";
  window.addEventListener("load", () => {
    const pages = Array.from(
      document.querySelectorAll(".entry-inner .entry-content p>img")
    );
    makeLightbox(pages);
  });

  function makeLightbox(images) {
    if (
      images instanceof Array &&
      images.length > 0 &&
      images.every((img) => img instanceof HTMLImageElement)
    ) {
      // The base code inside this if-statement was AI generated. I have
      // manually tweaked it from its original to improve readability.

      addStyleSheet(
        `\
        .slm-nora-lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .slm-nora-lightbox-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: white;
          font-size: 4rem;
          cursor: pointer;
          visibility: visible; /* hacky fix */
        }

        .no-transition {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          transition: none !important;
        }
        `, true
      );

      // Create the lightbox
      const lightbox = document.createElement("div");
      lightbox.id = "manga-lightbox";
      lightbox.classList.add("slm-nora-lightbox");

      // Create the img element for displaying images
      const imgElement = document.createElement("img");
      imgElement.style.maxWidth = "90%";
      imgElement.style.maxHeight = "90%";
      lightbox.appendChild(imgElement);

      // Create navigation buttons
      const prevButton = createNavButton("▶", "prev");
      const nextButton = createNavButton("◀", "next");

      lightbox.appendChild(prevButton);
      lightbox.appendChild(nextButton);

      // Append lightbox to document body
      document.body.appendChild(lightbox);

      let currentIndex = 0;

      // Show lightbox and load the clicked image
      images.forEach((img, index) => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          currentIndex = index;
          updateImage();
          updateNavButtons();
          lightbox.style.visibility = "visible";
          lightbox.style.display = "";
          lightbox.style.opacity = "1";
        });
      });

      window.addEventListener("keydown", (e) => {
        if (lightbox.style.visibility !== "visible") {
          return;
        }

        switch (e.key) {
          case "ArrowLeft":
            flipNext();
            break;

          case "ArrowRight":
            flipPrev();
            break;

          case "Escape":
            hideLightbox();
            break;

          default:
            break;
        }

        e.preventDefault();
      });

      // Hide lightbox on background click
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          hideLightbox();
        }
      });

      // Navigation button handlers
      prevButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent lightbox background from closing
        flipPrev();
      });

      nextButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent lightbox background from closing
        flipNext();
      });

      function modalEventDisabler(e) {
        e.preventDefault();
      }

      function hideLightbox() {
        lightbox.style.visibility = "hidden";
        lightbox.style.display = "none"
        lightbox.style.opacity = "0";
      }

      function flipPrev() {
        if (prevButton.style.visibility !== "visible") {
          return;
        }
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
        updateNavButtons();
      }

      function flipNext() {
        if (nextButton.style.visibility !== "visible") {
          return;
        }
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
        updateNavButtons();
      }

      function updateImage() {
        imgElement.src = images[currentIndex].src;
        preloadAdjacentImages();
      }

      function updateNavButtons() {
        if (currentIndex === 0) {
          prevButton.style.visibility = "hidden";
        } else {
          prevButton.style.visibility = "visible";
        }
        if (currentIndex === images.length - 1) {
          nextButton.style.visibility = "hidden";
        } else {
          nextButton.style.visibility = "visible";
        }
      }

      function preloadAdjacentImages() {
        const preloadPrev = new Image();
        preloadPrev.src =
          images[(currentIndex - 1 + images.length) % images.length].src;
        const preloadNext = new Image();
        preloadNext.src = images[(currentIndex + 1) % images.length].src;
      }

      function createNavButton(label, direction) {
        const button = document.createElement("button");
        button.textContent = label;
        button.classList.add("slm-nora-lightbox-button");
        button.classList.add("no-transition");
        button.style.cssText =
          direction === "prev" ? "right: 20px;" : "left: 20px;";
        return button;
      }
    } else {
      console.error("There was an error loading the images");
    }
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
    document.head.append(style);
  }
})();
