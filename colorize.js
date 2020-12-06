/*!
 * License: MIT
 * Author: Mustafa İlhan, http://ilhan-mstf.github.io/
 * Contributors:
 * - Olivier Guimbal, https://github.com/oguimbal
 * - Vikrant Sharma, https://github.com/svikrant2014
 * - Kris Thom White, https://github.com/ktwbc
 */

'use strict'

/* global AnsiUp, localStorage */

const colors = ["#F9DBBD", "#CDC7E5", "#F6A5A2", "#FFF399", "#C4F4C7", "#E8E1EF", "#D9FFF8", "#ADFFE5", "#E6DBD0", "#C7FFDA", "#FCA17D", "#FCD0A1", "#FAFFD8", "#A3F7B5", "#D8B4E2"]

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
  
  .logs__log-events-table__cell {
      font-family: "Helvetica Neue", Roboto, Arial, sans-serif;
      font-size: 14px;
  }
  
  .logs__log-events-table__cursor-text {
      font-family: "Helvetica Neue", Roboto, Arial, sans-serif;
      font-size: 14px;
  }

  .logs__log-events-table__timestamp-cell {
      font-family: "Helvetica Neue", Roboto, Arial, sans-serif;
      font-size: 14px;
  }

  `
  document.head.appendChild(style)
}

function insertTools () {
  const panel = document.createElement('div')
  let panelHtml = `<div id="logs-tweaker-panel">`
  if (isNewDesign()) {
    panelHtml = `${ panelHtml }
    <label class="container-checkbox"> Replace Fonts
      <input type="checkbox" id="logs-tweaker-fonts" ${ fontsOn() ? 'checked="checked"' : '' }>
      <span class="checkmark"></span>
    </label>
  `
  } else {
    panelHtml = `${ panelHtml }
    <label class="container-checkbox"> Fullscreen
      <input type="checkbox" id="logs-tweaker-fullscreen" ${ fullscreenOn() ? 'checked="checked"' : '' }>
      <span class="checkmark"></span>
    </label>
    <label class="container-checkbox"> Follow tail
      <input type="checkbox" id="logs-tweaker-autorefresh" ${ autorefreshOn() ? 'checked="checked"' : '' }>
        <span class="checkmark"></span>
    </label>
  `
  }
  
  panel.innerHTML = panelHtml + '</div>'
  document.body.append(panel)

  if (isNewDesign()) {
    setupNewToggles()
  } else {
    setupOldToggles()
  }
}

function setupOldToggles () {
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

function setupNewToggles () {
  // toggle replace fonts
  document.getElementById('logs-tweaker-fonts').onchange = t => {
    const { checked } = t.target
    if (checked) {
      localStorage.setItem('logs-tweaker-fonts', 'yes')
    } else {
      localStorage.removeItem('logs-tweaker-fonts')
    }
    refreshFonts()
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
  if (window.location.hash.includes('#logEventViewer') || isNewDesign()) {
    if (!isNewDesign()) {
      refreshOldDesign()
    } else {
      refreshNewDesign()
    }
    if (document.getElementById('logs-tweaker-panel')) {
      return
    }
    insertStylesheet()
    insertTools()
  } else {
    removeTools()
  }
}, 1000)

function refreshOldDesign () {
  refreshAutoRefresh()
  refreshFullscreen()
}

function refreshNewDesign () {
  refreshAutoRefresh()
  refreshFullscreen()
}

function fullscreenOn () {
  return !!localStorage.getItem('logs-tweaker-fullscreen')
}

function fontsOn () {
  return !!localStorage.getItem('logs-tweaker-fonts')
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

function refreshFonts () {
  const elements = getElements()
  elements.forEach(element => changeFontElement(element, fontsOn() ? 'set' : 'clear'))
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

function isCheckedForDecorated (element) {
  return element.dataset.checkedForDecorated !== 'yes'
}

function setCheckedForDecorated (element) {
  element.dataset.checkedForDecorated = 'yes'
  return element
}

function isCheckedForBold (element) {
  return element.dataset.checkedForBold !== 'yes'
}

function setCheckedForBold (element) {
  element.dataset.checkedForBold = 'yes'
  return element
}

function isStartLine (element) {
  return element.innerHTML.includes('START RequestId:')
}

function isEndLine (element) {
  return element.innerHTML.includes('REPORT RequestId:')
}

function isErrorLine (element) {
  const text = element.innerHTML.toLowerCase()
  return text.includes('error')
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

function colorizeElement (element, color) {
  element.style.backgroundColor = color
  return element
}

function changeFontElement (element, action) {
  if (element.dataset.isFontHandled !== 'yes' || action) {
    element.dataset.isFontHandled = 'yes'
    element.height = '20px'
    element.lineHeight = '20px'

    let subElements = element.getElementsByClassName('logs__log-events-table__cell')
    for (let e of subElements) {
      if (action === 'clear') {
        e.style.fontFamily = null;
        e.style.fontSize = null;
        e.style.paddingLeft = null;
      } else {
        e.style.fontFamily = '"Helvetica Neue", Roboto, Arial, sans-serif'
        e.style.fontSize = '0.9em'
        e.style.paddingLeft = '5px'
      }
    }
  }
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
        .filter(isCheckedForDecorated)
        .map(setCheckedForDecorated)
        .filter(isStartOrEnd)
        .map(getEventId)))
}

function changeFontOnGroup (elements) {
  elements.forEach(changeFontElement)
}

function colorizeGroup (elements) {
  let color = colors[Math.floor((Math.random() * 10000)) % colors.length]
  elements.forEach(element => colorizeElement(element, color))
}

function decorateGroups (elements) {
  let eventIds = getUniqueEventIds(elements)
  let newDesign = isNewDesign()
  if (eventIds) {
    eventIds.forEach(
      id => {
        colorizeGroup(elements.filter(element => hasId(element, id)))
        if (newDesign && fontsOn()) changeFontOnGroup(elements)
      })
  }
}

function applyAnsiTransform (e) {
  if (e) {
    const txt = e.childNodes[0]
    const textValue = txt.textContent || ''
    if (/(^|\x1b)\[(\d+)m/.test(textValue)) {
      e.classList.add('ansiColorized')
      e.innerHTML = ansiTransform.ansi_to_html(textValue)
    }
  }
}

function colorizeAnsi (elements) {
  for (let e of elements) {
    if (e.dataset.isAnsiColorizedHandled !== 'yes') {
      e.dataset.isAnsiColorizedHandled = 'yes'
      applyAnsiTransform(e.getElementsByClassName("logs__log-events-table__cell")[1])
    }
  }
}

function getElements () {
  let elements

  const newDesignElements = document.querySelectorAll('iframe#microConsole-Logs')[0]

  if (newDesignElements) {
    elements = newDesignElements.contentDocument.getElementsByClassName('awsui-table-row')
  } else {
    elements = document.getElementsByClassName('cwdb-ellipsis')
  }

  return [].slice.call(elements)
}

function isNewDesign () {
  return window.location.hash.includes('#logsV2:log-groups/log-group') && window.location.hash.includes('/log-events')
}

function colorizeAll () {
  // console.time('cost-of-colorize')
  // console.time('cost-of-getting-elements')
  const elements = getElements()
  // console.timeEnd('cost-of-getting-elements')

  // console.time('cost-of-colorize-groups')
  decorateGroups(elements)
  // console.timeEnd('cost-of-colorize-groups')

  // console.time('cost-of-colorize-ansi')
  colorizeAnsi(elements)
  // console.timeEnd('cost-of-colorize-ansi')

  // console.time('cost-of-bold')
  makeBold(elements)
  // console.timeEnd('cost-of-bold')
  // console.timeEnd('cost-of-colorize')
}

setInterval(colorizeAll, 1000)
