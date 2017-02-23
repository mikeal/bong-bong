const funky = require('funky')
const spinner = require('./spinner')

const init = (elem, opts, id) => {
  let [room, ts] = id.split('@')
  elem.querySelector('bong-bong-loader').onclick = () => {
    let display = elem.parentNode
    elem.removeChild(elem.querySelector('bong-bong-loader'))
    elem.appendChild(spinner)
    opts.loadRecent(room, ts, (err, info) => {
      if (err) return console.error(err)
      if (info.length !== 20) return
      let more = view(opts, info[19])
      display.removeChild(elem)
      display.insertBefore(more, display.childNodes[0])
    })
  }
}

const view = funky`
${init}
<bong-bong-more>
  <style>
    bong-bong-more {
      display: flex;
      justify-content: center;
    }
    bong-bong-more bong-bong-loader,
    bong-bong-more bong-spinner {
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 5px;
      padding: 5px;
      margin-bottom: 10px;
      margin-left: 10px;
      margin-right: 10px;
      font-size: 15px;
      min-height: min-content;
    }
     bong-bong-more bong-spinner svg {
       max-width: 50px;
       max-height: 50px;
     }
  </style>
  <bong-bong-loader>Load previous messages.</bong-bong-loader>
</bong-bong-more>
`

module.exports = view
