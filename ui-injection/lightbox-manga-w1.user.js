// ==UserScript==
// @name        NoragamiMangaLightbox
// @namespace   slidav.Scripting
// @version     0.1.1
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
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.15s ease-in, visibility 0s 0.15s;
        }

        .slm-nora-lightbox.show {
          visibility: visible;
          opacity: 1;
          transition: opacity 0.15s ease-out, visibility 0s;
        }

        .slm-nora-image {
          max-width: 85%;
          max-height: 95%;
        }

        @media (orientation: portrait) {
          .slm-nora-image {
          }
        }

        .slm-nora-lightbox-button {
          all: unset;

          position: absolute;
          top: 0;
          height: 100%;
          background: none;
          border: none;
          color: white;
          font-size: 4rem;
          opacity: 0%;
          transition: opacity 0.075s ease-in;

          cursor: none;
          visibility: hidden;
        }

        .show .slm-nora-lightbox-button {
          cursor: pointer;
          visibility: visible;
        }

        .show .slm-nora-lightbox-button:hover {
          opacity: 50%;
        }

        .show .slm-nora-lightbox-button:active {
          opacity: 75%;
        }

        .slm-nora-lightbox-button.hide {
          cursor: none;
          visibility: hidden;
        }

        .slm-nora-lightbox-button-manga-prev {
          right: 20px;
        }

        .slm-nora-lightbox-button-manga-next {
          left: 20px;
        }

        .no-select {
          -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
             -khtml-user-select: none; /* Konqueror HTML */
               -moz-user-select: none; /* Old versions of Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none; /* Non-prefixed version, currently
                                          supported by Chrome, Edge, Opera and Firefox */
        }

        .no-transition {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          transition: none !important;
        }
        `,
        true
      );

      // Create the lightbox
      const lightbox = document.createElement("div");
      lightbox.id = "manga-lightbox";
      lightbox.classList.add("slm-nora-lightbox");

      // Create the img element for displaying images
      const imgElement = document.createElement("img");
      imgElement.classList.add("slm-nora-image");
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
          // lightbox.style.visibility = "visible";
          // lightbox.style.display = "flex";
          // lightbox.style.opacity = "1";
          lightbox.classList.add("show");
        });
      });

      window.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("show")) {
          return;
        }

        switch (e.key) {
          case "ArrowLeft":
            flipNext();
            e.preventDefault();
            break;

          case "ArrowRight":
            flipPrev();
            e.preventDefault();
            break;

          case "Escape":
            hideLightbox();
            e.preventDefault();
            break;

          default:
            break;
        }
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
        imgElement.focus();
        flipPrev();
      });

      nextButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent lightbox background from closing
        imgElement.focus();
        flipNext();
      });

      function modalEventDisabler(e) {
        e.preventDefault();
      }

      function hideLightbox() {
        lightbox.classList.remove("show");
      }

      function flipPrev() {
        if (prevButton.classList.contains("hide")) {
          return;
        }
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
        updateNavButtons();
      }

      function flipNext() {
        if (nextButton.classList.contains("hide")) {
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
        prevButton.classList.toggle("hide", currentIndex === 0);
        nextButton.classList.toggle("hide", currentIndex === images.length - 1);
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
        button.classList.add("no-select");
        button.classList.add("slm-nora-lightbox-button");
        button.classList.add(`slm-nora-lightbox-button-manga-${direction}`);
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
