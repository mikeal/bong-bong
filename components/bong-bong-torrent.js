const funky = require('funky')
const bel = require('bel')
const moment = require('moment')
const emojione = require('emojione')
const elementClass = require('element-class')

const mojimap = {
  'audio/': '🎧',
  'video/': '📼',
  'image/': '🖼',
  'default': '💿'
}

const startsWith = (str, x) => str.indexOf(x) === 0

function fileEmoji (type) {
  for (var key in mojimap) {
    if (startsWith(type, key)) return mojimap[key]
  }
  return mojimap.default
}

function fileElement (f) {
  let el = bel`
  <div class='bb-file'>
    ${ bel([emojione.unicodeToImage(fileEmoji(f.type))]) }
    <a><span class="bb-filename bb-not-downloaded">${ f.name }</span></a>
  </div>
  `
  return el
}

function init (elem, opts) {
  let webtorrent = opts.webtorrent
  let torrentAdded = () => {
    let hashes = webtorrent.torrents.map(t => t.infoHash)
    for (var i = 0; i < hashes.length; i++) {
      if (hashes[i] === opts.torrent.infoHash) return true
    }
    return false
  }

  let startDownload = () => {
    if (!torrentAdded()) {
      webtorrent.add(opts.torrent.magnetURI, torrent => {
        let _finished = () => {}

        let _update = () => {
          let downloaded = torrent.downloaded
          let percentage = Math.round(downloaded / torrent.length * 100)
          let val = `( ${percentage}% )`
          elem.querySelector('span.bb-download-radio').textContent = val
          if (downloaded !== torrent.length) setTimeout(_update, 1000)
          else _finished()
        }
        _update()


        let filemap = {}
        torrent.files.forEach(f => { filemap[f.name] = f })
        let selector = 'div.bb-file span.bb-filename'
        ;[...elem.querySelectorAll(selector)].forEach(el => {
          let name = el.textContent.trim()
          if (filemap[name]) {
            filemap[name].getBlobURL((err, url) => {
              if (err) return console.error(err)
              elementClass(el).remove('bb-not-downloaded')
              el.parentNode.href = url
              el.parentNode.download = name
            })
          }
        })
      })
    }
    elem.querySelector('span.bb-download').style.display = 'none'
    // TODO: change to pause button
  }
  elem.querySelector('span.bb-download').onclick = startDownload
}

const downarrow = () => bel([emojione.toImage(':arrow_down:')])

const view = funky`
${init}
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    <span class="ts" ts="${ doc => doc.ts }"
    >${ doc => {
      let now = Date.now()
      if ((now - doc.ts) < 10 * 60 * 1000) {
        return moment(doc.ts).fromNow()
      } else {
        return moment(doc.ts).calendar()
      }
    }}</span>
    <span class="bb-download">${ downarrow() }</span>
    <span class="bb-download-radio"></span>
  </div>
  <bong-bong-torrent>
  ${ opts => opts.files.map(f => {
    return fileElement(f)
  }) }
  </bong-bong-torrent>
</bong-bong-message>
`

module.exports = view
