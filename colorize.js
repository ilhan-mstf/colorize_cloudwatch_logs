/*!
 * License: MIT
 * Author: Mustafa İlhan, http://ilhan-mstf.github.io/
 * Contributors:
 * - Olivier Guimbal, https://github.com/oguimbal
 */

'use strict'

/* global AnsiUp */

const colors = ['#FFD54F', '#BCAAA4', '#90CAF9', '#FFCC80', '#FBE9E7', '#B0BEC5', '#DCE775', '#A5D6A7', '#81C784', '#9FA8DA', '#E0E0E0', '#CFD8DC', '#F48FB1', '#F8BBD0', '#F0F4C3', '#C0CA33', '#CE93D8', '#80CBC4', '#E1BEE7', '#CDDC39', '#C5CAE9', '#EF9A9A', '#FFFF00', '#B2EBF2', '#BDBDBD', '#FFE57F', '#B2DFDB', '#BBDEFB', '#69F0AE', '#FFCDD2', '#9CCC65', '#80DEEA', '#76FF03', '#B2FF59', '#C8E6C9']

const ansiTransform = new AnsiUp()
delete window.AnsiUp // just delete it so its hidden from global space

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
`
document.head.appendChild(style)

function isCheckedForColorized (element) {
  return element.dataset.checkedForColorized !== 'yes'
}

function setCheckedForColorized (element) {
  element.dataset.checkedForColorized = 'yes'
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
  return element.innerHTML.includes('[ERROR]')
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
  let elements = document.getElementsByClassName('cwdb-ellipsis')
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

  // console.time('cost-of-colorize-ansi')
  colorizeAnsi(elements)
  // console.timeEnd('cost-of-colorize-ansi')

  // console.time('cost-of-bold')
  makeBold(elements)
  // console.timeEnd('cost-of-bold')
  // console.timeEnd('cost-of-colorize')
}

setInterval(colorizeAll, 1000)
