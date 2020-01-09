/*!
 * License: MIT
 * Author: Mustafa İlhan
 * http://ilhan-mstf.github.io/
 */

'use strict'

let colors = ['#FFD54F', '#BCAAA4', '#90CAF9', '#FFCC80', '#FBE9E7', '#B0BEC5', '#DCE775', '#A5D6A7', '#81C784', '#9FA8DA', '#E0E0E0', '#CFD8DC', '#F48FB1', '#F8BBD0', '#F0F4C3', '#C0CA33', '#CE93D8', '#80CBC4', '#E1BEE7', '#CDDC39', '#C5CAE9', '#EF9A9A', '#FFFF00', '#B2EBF2', '#BDBDBD', '#FFE57F', '#B2DFDB', '#BBDEFB', '#69F0AE', '#FFCDD2', '#9CCC65', '#80DEEA', '#76FF03', '#B2FF59', '#C8E6C9']

const ainsiTransform = new AnsiUp();
delete window.AnsiUp; // just delete it so its hidden from global space


function insertStylesheet() {

  // dont know why, but all "spans" that are insterted in cwdb-ellipsis are blinking
  // this class prevents that from happening
  const style = document.createElement('style');
  style.textContent = `
  .classColorized span {
    -webkit-animation-name: unset !important;
    -moz-animation-name: unset !important;
    -ms-animation-name: unset !important;
    animation-name: unset !important;
  }

  /* The container */
  .container-checkbox {
      display: block;
      position: relative;
      padding-left: 35px;
      cursor: pointer;
      font-size: 22px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
  }

  /* Hide the browser's default checkbox */
  .container-checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
  }

  /* Create a custom checkbox */
  .container-checkbox .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 25px;
      width: 25px;
      background-color: #eee;
  }

  /* On mouse-over, add a grey background color */
  .container-checkbox:hover input ~ .checkmark {
      background-color: #ccc;
  }

  /* When the checkbox is checked, add a blue background */
  .container-checkbox input:checked ~ .checkmark {
      background-color: #2196F3;
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .container-checkbox .checkmark:after {
      content: "";
      position: absolute;
      display: none;
  }

  /* Show the checkmark when checked */
  .container-checkbox input:checked ~ .checkmark:after {
      display: block;
  }

  /* Style the checkmark/indicator */
  .container-checkbox .checkmark:after {
      left: 9px;
      top: 5px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
  }



  #logs-tweaker-panel {
    position: fixed;
    z-index: 1000000;
    bottom: 20px;
    right: 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    padding: 5px;
  }

  .cwdb-log-viewer-table-container.fullscreen .cwdb-log-viewer-table-body {
    position: fixed;
    background: white;
    margin-top: 0;
    top: 40px;
    left: 0;
    bottom: 0;
    right: 0;
    height: unset;
  }
  `
  document.head.appendChild(style);
}

function insertTools() {

  const panel = document.createElement('div');
  panel.innerHTML = `<div id="logs-tweaker-panel">
    <label class="container-checkbox"> Fullscreen
      <input type="checkbox" id="logs-tweaker-fullscreen" ${fullscreenOn() ? 'checked="checked"' : ''}>
      <span class="checkmark"></span>
    </label>
    <label class="container-checkbox"> Follow tail
      <input type="checkbox" id="logs-tweaker-autorefresh" ${autorefreshOn() ? 'checked="checked"' : ''}>
      <span class="checkmark"></span>
    </label>
  </div>`
  document.body.append(panel);
  // toggle fullscreen
  document.getElementById('logs-tweaker-fullscreen').onchange = t => {
    const { checked } = t.target;
    if (checked) {
      localStorage.setItem('logs-tweaker-fullscreen', 'yes');
    } else {
      localStorage.removeItem('logs-tweaker-fullscreen');
    }
    refreshFullscreen();
  }

  // toggle auto refresh
  document.getElementById('logs-tweaker-autorefresh').onchange = t => {
    const { checked } = t.target;
    if (checked) {
      localStorage.setItem('logs-tweaker-autorefresh', 'yes');
    } else {
      localStorage.removeItem('logs-tweaker-autorefresh');
    }
    refreshAutoRefresh();
  }
}

// add "auto refresh" & "fullscreen"
setInterval(() => {
  refreshAutoRefresh();
  refreshFullscreen();
  if (document.getElementById('logs-tweaker-panel')) {
    return;
  }
  insertStylesheet();
  insertTools();
}, 1000);

function fullscreenOn() {
  return !!localStorage.getItem('logs-tweaker-fullscreen')
}

let _fsOn = false;
function refreshFullscreen() {
  const elt = document.getElementsByClassName('cwdb-log-viewer-table-container')[0];
  if (!elt) {
    return;
  }
  if (fullscreenOn()) {
    if (!elt.classList.contains('fullscreen')) {
      elt.classList.add('fullscreen');
    }
  } else {
    elt.classList.remove('fullscreen');
  }
}

function autorefreshOn() {
  return !!localStorage.getItem('logs-tweaker-autorefresh');
}
let autorefreshInterval = null;
function refreshAutoRefresh() {
  if (autorefreshOn()) {
    if (!autorefreshInterval) {
      autorefreshInterval = setInterval(refreshTail, 3000);
      refreshTail();
    }
  } else {
    clearInterval(autorefreshInterval);
    autorefreshInterval = null;
  }
}

function refreshTail() {
  const refresh = document.getElementsByClassName('cwdb-log-viewer-table-infinite-loader-bottom')[0];
  if (!refresh) {
    return;
  }
  let a = refresh.firstElementChild;
  while (a && a.tagName !== 'A') {
    a = a.nextElementSibling;
  }
  if (a) {
    a.click();
    // scroll to bottom
    const div = document.getElementsByClassName('cwdb-log-viewer-table-body')[0];
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }
}


function colorizeElement (x, color) {
  x.style.backgroundColor = color
  x.className = x.className + ' cw-logs-colorized'
  return x
}

function selectStartAndEnd (x) {
  return selectStart(x) || selectEnd(x)
}

function eliminateAlreadyColorizedOnes (x) {
  return !x.className.includes('cw-logs-colorized')
}

/*
 * Gets event id from the html
 */
function selectEventId (x) {
  return x.innerHTML.replace(/\n/g, ' ').match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g)[0]
}

/*
 * Gets unique id list of events
 */
function getIdList (x) {
  return Array.from(new Set(x.filter(eliminateAlreadyColorizedOnes).filter(selectStartAndEnd).map(selectEventId)))
}

function colorizeGroup (elements) {
  let color = colors[Math.floor(Math.random() * colors.length)]
  elements.map(x => colorizeElement(x, color))
}

function colorizeAinsi (elements) {
  for (let e of elements) {
    if (!e.classList.contains('classColorizedHandled')) {
      e.classList.add('classColorizedHandled');
      if (e.childNodes.length !== 1 || e.childNodes[0].nodeType !== 3) {
        continue; // expecting only one child text node
      }
      const txt = e.childNodes[0];
      const textValue = txt.textContent || '';
      if (/(^|\x1b)\[(\d+)m/.test(textValue)) {
        e.classList.add('classColorized');
        const transformed = ainsiTransform.ansi_to_html(textValue);
        e.innerHTML = transformed;
      }
    }
  }
}

function colorizeAll () {
  // console.time('cost-of-colorize')
  let elements = document.getElementsByClassName('cwdb-ellipsis')
  elements = [].slice.call(elements)
  let idList = getIdList(elements)
  if (idList) {
    idList.map(id => colorizeGroup(elements.filter(x => x.innerHTML.includes(id))))
  }

  colorizeAinsi(elements);
  // console.timeEnd('cost-of-colorize')

  // console.time('cost-of-bold')
  makeBold(elements)
  // console.timeEnd('cost-of-bold')
}

setInterval(colorizeAll, 1000)

function selectStart (x) {
  return x.innerHTML.includes('START RequestId:')
}

function selectEnd (x) {
  return x.innerHTML.includes('REPORT RequestId:')
}

function selectError (x) {
  return x.innerHTML.includes('[ERROR]')
}

function selectEndAndError (x) {
  return selectError(x) || selectEnd(x)
}

function makeBold (elements) {
  elements.filter(selectEndAndError).filter(eliminateAlreadyBoldOnes).map(makeBoldElement)
}

function makeBoldElement (x) {
  x.style.fontWeight = 600
  x.className = x.className + ' bold-cw-logs'
  return x
}

function eliminateAlreadyBoldOnes (x) {
  return !x.className.includes('bold-cw-logs')
}
