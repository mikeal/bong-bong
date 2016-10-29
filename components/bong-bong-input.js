const shaolin = require('../../funky')
const emojione = require('emojione')
const select = require('selection-range')


function init (elem) {
  let supress = (e) => {
    if (e.which === 8) {
      console.log(e.which)
      // e.preventDefault()
      // e.returnValue = false
      // return false
    }
    console.log(e.target)
  }

  elem.on('connected', (bool) => {
    if (!bool) return // disconnected

    let textarea = elem.shadowRoot.querySelector('textarea')

    let onKeydown = (e) => {
      let value = textarea.textContent
      let replace = (str) => {
        textarea.textContent = str
      }
      let selection = window.getSelection()
      let selectedText = selection.toString()
      let selectedRange = selection.getRangeAt(0)

      console.log(select(textarea))

      switch (e.which) {
        case 8: {
          // Backspace
          console.log(selectedRange)
          select(textarea, { start: 5 })

          replace(value.slice(0, value.length - 1))
          select(textarea, 3)
          break
        }
      }
    }

    textarea.onkeydown = onKeydown
  })
}

shaolin`
${init}
<bong-bong-input>
</bong-bong-input>
<style>
  :host {
    width:100%;
  }
  textarea {
    border-radius: 4px;
    -khtml-border-radius: 4px;
    width: 100%;
    margin-bottom: 1.5em;
    border: 1px solid #d3d3d3;
    font-size: 1em;
    min-height: 6em;
  }
</style>
<textarea></textarea>
<slot></slot>
`
