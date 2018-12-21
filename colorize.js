/*!
 * License: MIT
 * Author: Mustafa İlhan
 * http://ilhan-mstf.github.io/
 */

'use strict'

let colors = ['#FFD54F', '#BCAAA4', '#90CAF9', '#FFCC80', '#FBE9E7', '#B0BEC5', '#DCE775', '#A5D6A7', '#81C784', '#9FA8DA', '#E0E0E0', '#CFD8DC', '#F48FB1', '#F8BBD0', '#F0F4C3', '#C0CA33', '#CE93D8', '#80CBC4', '#E1BEE7', '#CDDC39', '#C5CAE9', '#EF9A9A', '#FFFF00', '#B2EBF2', '#BDBDBD', '#FFE57F', '#B2DFDB', '#BBDEFB', '#69F0AE', '#FFCDD2', '#9CCC65', '#80DEEA', '#76FF03', '#B2FF59', '#C8E6C9']

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

function colorizeAll () {
  // console.time('cost-of-colorize')
  let elements = document.getElementsByClassName('cwdb-ellipsis')
  elements = [].slice.call(elements)
  let idList = getIdList(elements)
  if (idList) {
    idList.map(id => colorizeGroup(elements.filter(x => x.innerHTML.includes(id))))
  }
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
