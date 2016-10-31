const funky = require('../../funky')
const emojione = require('emojione')
const select = require('selection-range')
const emojiRegex = require('emoji-regex')

function count (str, s1) {
  return (str.length - str.replace(new RegExp(s1, 'g'), '').length) / s1.length
}

function init (elem, opts) {
  let textarea = elem.querySelector('div.bb-textinput')

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
    for (let i = 0; i < textarea.children.length; i++) {
      let el = textarea.children[i]
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
    let selection = select(textarea)

    let colons = count(value, ':')

    if (colons > 1 || emojiRegex().test(textContent)) {
      replace(emojione.toImage(value))
      let len = textContent.length
      // if (selection.end >= len)
      setCursorToEnd(textarea)
    }

    switch (e.which) {
      case 8: {
        // Backspace
        break
      }
      case 13: {
        if (!e.shiftKey && !e.ctrlKey) {
          e.preventDefault()
          post()
          break
        }
      }
    }
  }
  textarea.onkeypress = onKeyup
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
