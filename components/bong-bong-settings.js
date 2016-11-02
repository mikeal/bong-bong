/* globals */
const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')

const gearImage = emojione.shortnameToImage(':gear:')
const floppyImage = emojione.unicodeToImage('💾')

function show (el) {
  el.style['display'] = 'block'
}
function hide (el) {
  el.style['display'] = 'none'
}

function init (elem, opts) {
  if (!opts.storage) throw new Error('Must pass storage.')
  let save = () => {
    let val = elem.querySelector('div#bb-settings-nick-input').textContent
    opts.storage.set('nickname', val)
  }
  let showSettings = () => {
    let emoji = elem.querySelector('div.bb-settings-box img.emojione')
    hide(elem.querySelector('img'))
    show(elem.querySelector('div.bb-settings-box'))

    let nickname = elem.querySelector('div#bb-settings-nick-input')
    if (opts.storage.get('nickname')) {
      nickname.textContent = opts.storage.get('nickname')
    } else {
      nickname.onclick = () => {
        nickname.textContent = ''
        nickname.onclick = null
        nickname.click()
        nickname.focus()
      }
    }
    nickname.onkeydown = e => {
      if (e.which === 13) {
        e.preventDefault()
        emoji.click()
      }
    }
    elem.style.cursor = 'default'
    elem.onclick = null
    emoji.style.cursor = 'pointer'
    emoji.onclick = hideSettings
  }
  let hideSettings = (e) => {
    save()
    if (e.stopPropagation) {
      e.stopPropagation()
    } else {
      e.cancelBubble = true
    }
    show(elem.querySelector('img'))
    hide(elem.querySelector('div.bb-settings-box'))
    let emoji = elem.querySelector('img.emojione')
    emoji.style.cursor = 'pointer'
    emoji.onclick = showSettings
  }

  let emoji = elem.querySelector('img.emojione')
  emoji.style.cursor = 'pointer'
  emoji.onclick = showSettings
}

const view = funky`
${init}
<bong-bong-settings>
  <style>
  bong-bong-settings {
    cursor: pointer;
  }
  bong-bong-settings img {
    padding: 10px;
    width: 32px;
  }
  .bb-button {
    cursor: pointer;
    border-radius: 2px;
    border: 1px solid #d3d3d3;
  }
  bong-bong-settings div.bb-settings-box {
    padding: 0;
    margin: 0;
    line-height: 32px;
    vertical-align: middle;
    display: flex;
    align-items:flex-start;
    flex-direction: row;
  }
  bong-bong-settings div.bb-settings-box * {
    vertical-align: middle;
    flex: 1;
    display: inline-block;
  }
  span.unset-setting {
    cursor: pointer;
    color: grey;
  }
  </style>
  ${bel([gearImage])}
  <div class="bb-settings-box" style="display:none;">
    ${bel([floppyImage])}
    <div id="bb-settings-nick-input" contenteditable="true">
      <span class="unset-setting">Set Nickname</span>
    </div>
  </div>
</bong-bong-settings>
`

module.exports = view
