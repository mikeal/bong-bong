const funky = require('../../funky')
const emojione = require('emojione')
const select = require('selection-range')
const emojiRegex = require('emoji-regex')
const autocomplete = require('./autocomplete')
const bongBongEmojis = require('./bong-bong-emojis')
const uniq = require('lodash.uniq')

function count (str, s1) {
  return (str.length - str.replace(new RegExp(s1, 'g'), '').length) / s1.length
}

let keys = o => Object.keys(o)
let emojiList = keys(emojione.emojioneList)
let emojiComplete = autocomplete()

emojiList.forEach(str => {
  if (str[0] === ':') {
    let key = str.slice(1, str.length - 1)
    emojiComplete.add(key, str)
    if (key.indexOf('_')) {
      key.split('_').forEach(k => emojiComplete.add(k, str))
    }
  }
})

const startsWith = (str, x) => str.slice(0, x.length) === x

function sort (shortnames, search) {
  shortnames = uniq(shortnames).sort()
  let first = null
  let last = null
  for (var i = 0; i < shortnames.length; i++) {
    let short = shortnames[i]
    if (startsWith(short, ':' + search)) {
      if (first === null) first = i
      last = i
    }
  }
  return [].concat(
    shortnames.slice(first, last + 1),
    shortnames.slice(0, first),
    shortnames.slice(last + 1)
  )
}

function init (elem, opts) {
  const textarea = elem.querySelector('div.bb-textinput')
  const emojiView = bongBongEmojis([])
  setTimeout(() => {
    elem.parentNode.insertBefore(emojiView, elem)
  }, 0)

  function setCursorToEnd (el) {
    let range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    let sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  let replace = (str) => {
    textarea.innerHTML = str
  }

  let post = () => {
    let children = [...textarea.children]
    for (let i = 0; i < children.length; i++) {
      let el = children[i]
      if (el.className === 'emojione') {
        let str = el.getAttribute('alt')
        textarea.replaceChild(document.createTextNode(str), el)
      }
    }
    let txt = textarea.textContent
    if (opts.postTextMessage(txt)) {
      textarea.innerHTML = ''
    }
  }

  let onKeyup = (e) => {
    let value = textarea.innerHTML
    let textContent = textarea.textContent

    if (e && e.key && e.key !== ':') {
      value += e.key
      textContent += e.key
    }

    let colons = count(value, ':')

    if (colons > 1 || emojiRegex().test(textContent)) {
      replace(emojione.toImage(value))
      let len = textContent.length
      // if (selection.end >= len)
      setCursorToEnd(textarea)
    } else if (colons === 1) {
      let search = textContent.slice(textContent.lastIndexOf(':')+1)
      if (search.length) {
        let terms = sort(emojiComplete.complete(search), search)
        emojiView.update(terms)
      } else {
        emojiView.hide()
      }
    } else {
      emojiView.hide()
    }
  }
  textarea.onkeypress = onKeyup
  textarea.onkeydown = e => {
    switch (e.which) {
      case 8: {
        // Backspace
        textarea.onkeypress()
        break
      }
      case 13: {
        if (!e.shiftKey && !e.ctrlKey) {
          e.preventDefault()
          setTimeout(post, 0)
          break
        }
      }
    }
  }
}

const view = funky`
${init}
<bong-bong-input>
  <style>
    bong-bong-input {
      width:100%;
    }
    div.bb-textinput {
      border-radius: 4px;
      margin-bottom: 1.5em;
      border: 1px solid #d3d3d3;
      font-size: 1em;
      min-height: 1em;
      padding: 12px;
      margin: .5em;
    }
    div.bb-textinput img.emojione {
      max-height: 1.1em;
      font-size: 20px;
      margin-bottom: -2px;
      line-height: 18px;
    }
  </style>
  <div class="bb-textinput" contenteditable="true"></div>
</bong-bong-input>
`
module.exports = view
