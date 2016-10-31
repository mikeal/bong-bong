/* globals */
const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')

const gearImage = emojione.shortnameToImage(':gear:')

function show (el) {
  el.style['display'] = 'block'
}
function hide (el) {
  el.style['display'] = 'none'
}

function init (elem, opts) {
  if (!opts.storage) throw new Error('Must pass storage.')
  let save = () => {
    let val = elem.querySelector('input').value
    opts.storage.set('nickname', val)
  }
  let showSettings = () => {
    hide(elem.querySelector('img'))
    show(elem.querySelector('div.bb-settings-box'))
    elem.querySelector('input').value = opts.storage.get('nickname') || ''
    elem.style.cursor = 'default'
    elem.onclick = null
    elem.querySelector('.bb-button').onclick = hideSettings
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
    elem.style.cursor = 'pointer'
    elem.onclick = showSettings
  }

  elem.onclick = showSettings
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
  </style>
  ${bel([gearImage])}
  <div class="bb-settings-box" style="display:none;">
    <span>Nickname</span>
    <input type="text" />
    <button class="bb-button">
      Save
    </button>
  </div>
</bong-bong-settings>
`

module.exports = view
