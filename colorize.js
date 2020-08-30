/*!
 * License: MIT
 * Author: Mustafa İlhan, http://ilhan-mstf.github.io/
 * Contributors:
 * - Olivier Guimbal, https://github.com/oguimbal
 */

'use strict'

/* global AnsiUp, localStorage */

const colors = ['#FFD54F', '#BCAAA4', '#90CAF9', '#FFCC80', '#FBE9E7', '#B0BEC5', '#DCE775', '#A5D6A7', '#81C784', '#9FA8DA', '#E0E0E0', '#CFD8DC', '#F48FB1', '#F8BBD0', '#F0F4C3', '#C0CA33', '#CE93D8', '#80CBC4', '#E1BEE7', '#CDDC39', '#C5CAE9', '#EF9A9A', '#FFFF00', '#B2EBF2', '#BDBDBD', '#FFE57F', '#B2DFDB', '#BBDEFB', '#69F0AE', '#FFCDD2', '#9CCC65', '#80DEEA', '#76FF03', '#B2FF59', '#C8E6C9']


const ansiTransform = new AnsiUp()
delete window.AnsiUp // just delete it so its hidden from global space

function insertStylesheet () {
  // dont know why, but all "spans" that are insterted in cwdb-ellipsis are blinking
  // this class prevents that from happening
  const style = document.createElement('style')
  style.textContent = `
  .ansiColorized span {
      -webkit-animation-name: unset !important;
      -moz-animation-name: unset !important;
      -ms-animation-name: unset !important;
      animation-name: unset !important;
  }

  /* The container */
  .container-checkbox {
      display: block;
      position: relative;
      padding-left: 20px;
      cursor: pointer;
      font-size: 13px;
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
      height: 16px;
      width: 16px;
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
      left: 4px;
      top: 0px;
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
      bottom: 30px;
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
  document.head.appendChild(style)
}

function insertTools () {
  const panel = document.createElement('div')
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
  document.body.append(panel)

  // toggle fullscreen
  document.getElementById('logs-tweaker-fullscreen').onchange = t => {
    const { checked } = t.target
    if (checked) {
      localStorage.setItem('logs-tweaker-fullscreen', 'yes')
    } else {
      localStorage.removeItem('logs-tweaker-fullscreen')
    }
    refreshFullscreen()
  }

  // toggle auto refresh
  document.getElementById('logs-tweaker-autorefresh').onchange = t => {
    const { checked } = t.target
    if (checked) {
      localStorage.setItem('logs-tweaker-autorefresh', 'yes')
    } else {
      localStorage.removeItem('logs-tweaker-autorefresh')
    }
    refreshAutoRefresh()
  }
}

function removeTools () {
  const element = document.getElementById('logs-tweaker-panel')
  if (element) {
    element.parentNode.removeChild(element)
  }
}

// add "auto refresh" & "fullscreen"
setInterval(() => {
  if (window.location.hash.includes('#logEventViewer')) {
    refreshAutoRefresh()
    refreshFullscreen()
    if (document.getElementById('logs-tweaker-panel')) {
      return
    }
    insertStylesheet()
    insertTools()
  } else {
    removeTools()
  }
}, 1000)

function fullscreenOn () {
  return !!localStorage.getItem('logs-tweaker-fullscreen')
}

function refreshFullscreen () {
  const elt = document.getElementsByClassName('cwdb-log-viewer-table-container')[0]
  if (!elt) {
    return
  }
  if (fullscreenOn()) {
    if (!elt.classList.contains('fullscreen')) {
      elt.classList.add('fullscreen')
    }
  } else {
    elt.classList.remove('fullscreen')
  }
}

function autorefreshOn () {
  return !!localStorage.getItem('logs-tweaker-autorefresh')
}

let autorefreshInterval = null
function refreshAutoRefresh () {
  if (autorefreshOn()) {
    if (!autorefreshInterval) {
      autorefreshInterval = setInterval(refreshTail, 3000)
      refreshTail()
    }
  } else {
    clearInterval(autorefreshInterval)
    autorefreshInterval = null
  }
}

function refreshTail () {
  const refresh = document.getElementsByClassName('cwdb-log-viewer-table-infinite-loader-bottom')[0]
  if (!refresh) {
    return
  }
  let a = refresh.firstElementChild
  while (a && a.tagName !== 'A') {
    a = a.nextElementSibling
  }
  if (a) {
    a.click()
    // scroll to bottom
    const div = document.getElementsByClassName('cwdb-log-viewer-table-body')[0]
    if (div) {
      div.scrollTop = div.scrollHeight
    }
  }
}

function isCheckedForColorized (element) {
  return element.dataset.checkedForColorized !== 'yes'
}

function setCheckedForColorized (element) {
  element.dataset.checkedForColorized = 'yes'
  return element
}

function isCheckedForGeneralColorized (element) {
  return element.dataset.checkedForGeneralColorized !== 'yes'
}

function setCheckedForGeneralColorized (element) {
  element.dataset.checkedForGeneralColorized = 'yes'
  return element
}

function isCheckedForWarnColorized (element) {
  return element.dataset.checkedForWarnColorized !== 'yes'
}

function setCheckedForWarnColorized (element) {
  element.dataset.checkedForWarnColorized = 'yes'
  return element
}

function isCheckedForBold (element) {
  return element.dataset.checkedForBold !== 'yes'
}

function setCheckedForBold (element) {
  element.dataset.checkedForBold = 'yes'
  return element
}

function isCheckedForHighlightError (element) {
  return element.dataset.checkedForHighlightError !== 'yes'
}

function setCheckedForHighlightError (element) {
  element.dataset.checkedForHighlightError = 'yes'
  return element
}

function isStartLine (element) {
  return element.innerHTML.includes('START RequestId:')
}

function isEndLine (element) {
  return element.innerHTML.includes('REPORT RequestId:')
}

function isErrorLine (element) {
  return element.innerHTML.includes('[ERROR]') || element.innerHTML.includes('[Error ')
}

function isErrorOrEndLine (element) {
  return isErrorLine(element) || isEndLine(element)
}

function isStartOrEnd (element) {
  return isStartLine(element) || isEndLine(element)
}

function hasId (element, id) {
  return element.innerHTML.includes(id)
}

function isErrorLineGeneral (element) {
  const text = element.innerHTML.toLowerCase()
  return text.includes('error')
}

function isDebugOrInfo (element) {
  const text = element.innerHTML.toLowerCase()
  return text.includes('info') ||  text.includes('debug')
}

function isWarning (element) {
  const text = element.innerHTML.toLowerCase()
  return text.includes('warn')
}

function colorizeElement (element, color) {
  element.style.backgroundColor = color
  return element
}

function makeBoldElement (element) {
  element.style.fontWeight = 600
  return element
}

function makeBold (elements) {
  elements
    .filter(isCheckedForBold)
    .map(setCheckedForBold)
    .filter(isErrorOrEndLine)
    .forEach(makeBoldElement)
}

function colorizeDebugOrInfoGeneral (elements) {
  let color = '#ADD8E6'

  elements
    .filter(isCheckedForGeneralColorized)
    .map(setCheckedForGeneralColorized)
    .filter(isDebugOrInfo)
    .forEach(element => colorizeElement(element, color))
}

function colorizeWarnLevel (elements) {
  let color = '#FFFCBB'

  elements
    .filter(isCheckedForWarnColorized)
    .map(setCheckedForWarnColorized)
    .filter(isWarning)
    .forEach(element => colorizeElement(element, color))
}

function colorizeErrorGeneral (elements) {
  let color = '#FA8072'

  elements
    .filter(isCheckedForHighlightError)
    .map(setCheckedForHighlightError)
    .filter(isErrorLineGeneral)
    .forEach(element => colorizeElement(element, color))
}

function getEventId (element) {
  return element
    .innerHTML
    .replace(/\n/g, ' ')
    .match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g)[0]
}

function getUniqueEventIds (eventIds) {
  return Array.from(
    new Set(
      eventIds
        .filter(isCheckedForColorized)
        .map(setCheckedForColorized)
        .filter(isStartOrEnd)
        .map(getEventId)))
}

function colorizeGroup (elements) {
  let color = colors[Math.floor(Math.random() * colors.length)]
  elements.forEach(element => colorizeElement(element, color))
}

function colorizeGroups (elements) {
  let eventIds = getUniqueEventIds(elements)
  if (eventIds) {
    eventIds.forEach(
      id => colorizeGroup(elements.filter(element => hasId(element, id))))
  }
}

function applyAnsiTransform (e) {
  const txt = e.childNodes[0]
  const textValue = txt.textContent || ''
  if (/(^|\x1b)\[(\d+)m/.test(textValue)) {
    e.classList.add('ansiColorized')
    e.innerHTML = ansiTransform.ansi_to_html(textValue)
  }
}

function colorizeAnsi (elements) {
  for (let e of elements) {
    if (e.dataset.isAnsiColorizedHandled !== 'yes') {
      e.dataset.isAnsiColorizedHandled = 'yes'
      if (e.childNodes.length !== 1 || e.childNodes[0].nodeType !== 3) {
        continue // expecting only one child text node
      }
      applyAnsiTransform(e)
    }
  }
}

function getElements () {
  let elements;

  const newDesign = document.querySelectorAll('iframe#microConsole-Logs')[0]
  if (newDesign) {
    elements = newDesign.contentDocument.getElementsByClassName('awsui-table-row')
  } else {
    elements = document.getElementsByClassName('cwdb-ellipsis')
  }

  return [].slice.call(elements)
}

function colorizeAll () {
  // console.time('cost-of-colorize')
  // console.time('cost-of-getting-elements')
  const elements = getElements()
  // console.timeEnd('cost-of-getting-elements')

  // console.time('cost-of-colorize-groups')
  colorizeGroups(elements)
  // console.timeEnd('cost-of-colorize-groups')


  // console.time('cost-of-general-logs')
  //colorizeErrorGeneral(elements)
  //colorizeDebugOrInfoGeneral(elements)
  //colorizeWarnLevel(elements)
  // console.time('cost-of-general-logs')

  // console.time('cost-of-colorize-ansi')
  colorizeAnsi(elements)
  // console.timeEnd('cost-of-colorize-ansi')

  // console.time('cost-of-bold')
  makeBold(elements)
  // console.timeEnd('cost-of-bold')
  // console.timeEnd('cost-of-colorize')
}

setInterval(colorizeAll, 1000)
