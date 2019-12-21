/*!
 * License: MIT
 * Author: Mustafa İlhan
 * http://ilhan-mstf.github.io/
 */

'use strict'

let colors = ['#FFD54F', '#BCAAA4', '#90CAF9', '#FFCC80', '#FBE9E7', '#B0BEC5', '#DCE775', '#A5D6A7', '#81C784', '#9FA8DA', '#E0E0E0', '#CFD8DC', '#F48FB1', '#F8BBD0', '#F0F4C3', '#C0CA33', '#CE93D8', '#80CBC4', '#E1BEE7', '#CDDC39', '#C5CAE9', '#EF9A9A', '#FFFF00', '#B2EBF2', '#BDBDBD', '#FFE57F', '#B2DFDB', '#BBDEFB', '#69F0AE', '#FFCDD2', '#9CCC65', '#80DEEA', '#76FF03', '#B2FF59', '#C8E6C9']

const ainsiTransform = new AnsiUp();
delete window.AnsiUp; // just delete it so its hidden from global space

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
`
document.head.appendChild(style)


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
