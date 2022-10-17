# Desmos User-Scripts

This repository is a collection of user-scripts for my personal use to automate tasks in the web. If you find any of them useful, don't hesitate to install them.

The scripts in this collection are the following:

#### [Canvas Learning Management System](https://www.instructure.com/canvas)
1. **[Grades Highlighter][canvas-grades-highlighter]** — Adds a gradient of colors to the grade pages so that it's easy to identify at a glance in which assignments you did great and in which you did not-so-great. It looks like this:
<p align="center">
  <img src="https://i.imgur.com/Kxp73sH.png" width="200" />
</p>
The gradient goes from green at perfect score (A grade) to red at 60% (F grade). If you have any amount of extra credit it is marked in blue.

## Getting Started

All the scripts are developed for [TamperMonkey](https://www.tampermonkey.net/), a browser extension that runs user-scripts. Although the scripts might work in other userscript managers some fiddling might be needed to get them to work.

The general installation process is similar for all scripts. Using TamperMonkey it is as follows:

### Prerequisites

Follow the link to [TamperMonkey's website](https://www.tampermonkey.net/) where you can pick your preferred browser to install the extension.

### Installation

Once the extension is installed you can either navigate towards the respective script file in this repository and click `raw` on the upper right corner or click the following links for the script you want to install:

* [Grades Highlighter][cnvgradhighraw]

Either way you will be prompted by TamperMonkey to install the scripts. Click `install` or `reinstall` if you are updating. Once installed, you can periodically check for updates in TamperMonkey, and you will be served the latest changes from the master branch of this repository.

[canvas-grades-highlighter]: /canvas-lms-scripts/canvas-grades-highlighter.user.js
[cnvgradhighraw]: https://github.com/SlimRunner/desmos-scripts-addons/raw/master/desmovie-script/desmovie.user.js
