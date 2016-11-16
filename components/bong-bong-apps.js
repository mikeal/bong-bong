/* globals URL */
const funky = require('funky')
const bel = require('bel')

const blurModal = elem => {
  let modalElement = bel`
  <blur-modal>
    <style>
    blur-modal {
      position: absolute;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    blur-modal * {
      align-self: center;
    }
    </style>
    <div class="blur-modal-container">
    </div>
  </blur-modal>
  `
  let blur = px => {
    [...elem.children].forEach(el => {
      el.style.filter = `blur(${px || 5}px)`
    })
  }
  let remove = () => {
    modalElement.querySelector('div.blur-modal-container').innerHTML = ''
    elem.removeChild(modalElement)
    ;[...elem.children].forEach(el => {
      el.style.filter = ''
    })
  }
  let ret = (content, _blur) => {
    blur(_blur)
    modalElement.querySelector('div.blur-modal-container').appendChild(content)
    elem.appendChild(modalElement)
    return modalElement
  }
  modalElement.onclick = remove
  return ret
}

const modal = blurModal(document.body)

const view = funky`
<bong-bong-apps>
  <style>
  bong-bong-apps {
    display: none;
    flex-wrap: wrap;
    box-sizing: border-box;
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
  bong-bong-apps div.bb-app {
    padding: 5px;
    margin-left: 5px;
    margin-right: 5px;
    display: flex;
    order: 1;
    cursor: pointer;
    border-radius: 5px;
  }
  bong-bong-apps div.bb-app img {
    height: 50px;
    width: 50px;
  }
  bong-bong-apps div.bb-app:hover {
    background-color: #E0E0E0;
  }
  iframe.bong-bong-app-modal {
    border: 1px solid #e1e8ed;
  }
  </style>
  ${ apps => apps.map(app => {
    let ret = bel`
    <div class="bb-app">
      ${ bel`<img src="${ app.image }"></img>` }
    </div>
    `
    ret.onclick = (e) => {
      document.querySelector('div.bb-app-button').click()
      if (document.querySelector('bong-bong').appMessage) {
        document.querySelector('bong-bong').appMessage(app)
      }
    }
    return ret
  }) }
</bong-bong-apps>
`

module.exports = view
