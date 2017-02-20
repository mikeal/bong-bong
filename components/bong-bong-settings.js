/* globals */
const funky = require('funky')
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
  let emoji = elem.querySelector('img.emojione')
  emoji.style.cursor = 'pointer'
  emoji.onclick = () => alert('Not Implemented.')
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
</bong-bong-settings>
`

module.exports = view
