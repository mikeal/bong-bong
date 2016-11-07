const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')

const view = funky`
${ (elem, emojis) => {
  elem.hide = () => { elem.style.display = 'none' }
  let showhide = emojis => {
    if (emojis.length) {
      elem.style.display = 'block'
    } else {
      elem.hide()
    }
    if (elem.parentNode &&
        elem.parentNode.parentNode &&
        elem.parentNode.parentNode._reflow) {
      elem.parentNode.parentNode._reflow()
    }
  }
  elem.onupdate = showhide
  showhide(emojis)
  console.log('el', elem)
}}
<bong-bong-emojis>
  <style>
  bong-bong-emojis {
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box ;
    color: rgb(85, 84, 89);
    line-height: 16px;
    font-size: 15px;
    position: relative;
    width: 100%;
    z-index: 1000;
    -webkit-font-smoothing: antialiased;
    -webkit-user-select: none;
    max-height: 100px;
    overflow: auto;
    margin-top: 5px;
  }
  bong-bong-emojis div.emoji-complete {
    padding: 5px;
    margin-left: 5px;
    margin-right: 5px;
    display: flex;
    order: 1;
    cursor: pointer;
    border-radius: 5px;
  }
  bong-bong-emojis div.emoji-complete:hover {
    background-color: #E0E0E0;
  }
  bong-bong-emojis div.emoji-complete img {
    max-height: 15px;
    margin-left: 5px;
  }
  </style>
  ${ emojis => emojis.map(emoji => {
    let ret = bel`
    <div class="emoji-complete">
      <div class="emoji-shortname">${emoji}</div>
      ${ bel([emojione.shortnameToImage(emoji)]) }
    </div>
    `
    ret.onclick = (e) => {
      let shortname = ret.querySelector('div.emoji-shortname').textContent
      let input = document.querySelector('bong-bong-input div.bb-textinput')
      let inputText = input.innerHTML
      let trimmed = inputText.slice(0, inputText.lastIndexOf(':'))
      input.innerHTML = trimmed + shortname
      input.onkeypress()
      document.querySelector('bong-bong-emojis').hide()
    }
    return ret
  }) }
</bong-bong-emojis>
`

module.exports = view
