// ==UserScript==
// @name        NoragamiMangaLightbox
// @namespace   slidav.Scripting
// @version     0.2.0
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

      const stylesheet = addStyleSheet(
        `\
        .slm-nora-lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
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

          transform: translate(var(--slm-nora-image-x, 0px), var(--slm-nora-image-y, 0px)) scale(var(--slm-nora-image-scale, 1));
          transform-origin: top left;
          transition: transform 0.1s ease;
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
          right: 0px;
          grid-row: 1;
        }

        .slm-nora-lightbox-button-manga-next {
          left: 0px;
          grid-row: 1;
        }

        .slm-nora-hide-overflow {
          overflow: hidden;
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
      imgElement.draggable = false;
      imgElement.classList.add("slm-nora-image");
      lightbox.appendChild(imgElement);

      // Create navigation buttons
      const prevButton = createNavButton("▶", "prev");
      const nextButton = createNavButton("◀", "next");
      const progressBar = null;

      lightbox.appendChild(prevButton);
      lightbox.appendChild(nextButton);

      // Append lightbox to document body
      document.body.appendChild(lightbox);

      let currentIndex = 0;
      let imgScale = 1;
      let imgX = 0;
      let imgY = 0;

      let mseX = 0;
      let mseY = 0;
      let mseEnable = false;

      // Show lightbox and load the clicked image
      images.forEach((img, index) => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          currentIndex = index;
          updateImage();
          updateNavButtons();
          showLightbox();
        });
      });

      window.addEventListener("keydown", (e) =>
        modalEvent(e, dispatchKeybinds)
      );

      lightbox.addEventListener("wheel", (e) => modalEvent(e, zoomEvent));

      lightbox.addEventListener("touchmove", (e) =>
        modalEvent(e, e => {e.preventDefault();})
      );

      lightbox.addEventListener("mousedown", (e) =>
        modalEvent(e, dispatchMouse)
      );

      // Hide lightbox on background click
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          hideLightbox();
        }
      });

      imgElement.addEventListener("mousedown", imageDragSet);
      imgElement.addEventListener("mousemove", imageDrag);
      imgElement.addEventListener("mouseup", () => {mseEnable = false;});
      imgElement.addEventListener("dblclick", () => {
        updateImageScale(1);
        updateImageLocation(0, 0);
      });

      // Navigation button handlers
      prevButton.addEventListener("click", (e) => {
        // Prevent lightbox background from closing
        e.stopPropagation();
        imgElement.focus();
        flipPrev();
      });

      nextButton.addEventListener("click", (e) => {
        // Prevent lightbox background from closing
        e.stopPropagation();
        imgElement.focus();
        flipNext();
      });

      function modalEvent(e, callback) {
        if (lightbox.classList.contains("show")) {
          return callback(e);
        }
      }

      function dispatchKeybinds(e) {
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
          
          case "ArrowDown":
          case "ArrowUp":
            e.preventDefault();
            break;

          default: break;
        }
      }

      function zoomEvent(e) {
        if (e instanceof WheelEvent) {
          let scaleRatio = null;
          if (e.deltaY > 0) {
            // zoom out
            scaleRatio = updateImageScale(Math.max(imgScale - 0.3, 1));
          } else if (e.deltaY < 0) {
            // zoom in
            scaleRatio = updateImageScale(imgScale + 0.3);
          }

          if (scaleRatio !== null) {
            const rect = imgElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.x;
            const mouseY = e.clientY - rect.y;
            const newXLoc = imgX + mouseX * (1 - scaleRatio);
            const newYLoc = imgY + mouseY * (1 - scaleRatio);
            updateImageLocation(newXLoc, newYLoc);
          }

          e.preventDefault();
        } else {
          throw new TypeError("e is not a WheelEvent");
        }
      }

      function dispatchMouse(e) {
        switch (e.button) {
          case 1: // middle mouse
            e.preventDefault();
            break;
          
            default: break;
        }
      }

      function imageDragSet(e) {
        if (e instanceof MouseEvent && e.buttons > 0 && e.button === 0) {
          mseEnable = true;
          mseX = e.clientX;
          mseY = e.clientY;
        }
      }

      function imageDrag(e) {
        if (e instanceof MouseEvent && e.buttons > 0 && e.button === 0 && mseEnable) {
          const xDelta = e.clientX - mseX;
          const yDelta = e.clientY - mseY;
          updateImageLocation(imgX + xDelta, imgY + yDelta);
          mseX = e.clientX;
          mseY = e.clientY;
        }
      }

      function showLightbox() {
        lightbox.classList.add("show");
        document.body.classList.add("slm-nora-hide-overflow");
      }

      function hideLightbox() {
        lightbox.classList.remove("show");
        document.body.classList.remove("slm-nora-hide-overflow");
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
        updateImageScale(1);
        updateImageLocation(0, 0);
        imgElement.src = images[currentIndex].src;
        images[currentIndex].scrollIntoView();
        preloadAdjacentImages();
      }

      function updateImageScale(newScale) {
        if (typeof newScale !== "number") {
          throw TypeError("scale must be a number");
        }
        const scaleRatio = newScale / imgScale;
        imgScale = newScale;
        lightbox.style.setProperty("--slm-nora-image-scale", imgScale);
        return scaleRatio;
      }

      function updateImageLocation(x, y) {
        if (typeof x !== "number" || typeof y !== "number") {
          throw TypeError("x and y must be numbers");
        }
        imgX = x;
        imgY = y;
        lightbox.style.setProperty("--slm-nora-image-x", `${imgX}px`);
        lightbox.style.setProperty("--slm-nora-image-y", `${imgY}px`);
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
    return style;
  }
})();
