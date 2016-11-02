let latestPost = Date.now()
let moment = require('moment')

let setSpan = (span, text) => {
  while (span.firstChild) {
    span.removeChild(span.firstChild)
  }
  span.appendChild(document.createTextNode(text))
}

module.exports = () => {
  // Tick
  latestPost = Date.now()
}

setInterval(() => {
  // 10 second interval
  let now = Date.now()
  if ((now - latestPost) < (1 * 60 * 1000)) {
    let spans = [...document.querySelectorAll('span.ts')].reverse()
    for (var i = 0; i < spans.length; i++) {
      let elem = spans[i]
      let ts = +elem.getAttribute('ts')
      if (now - ts > (10 * 60 * 1000)) {
        return // Anything that far back is already set
      }
      if (now - ts > (5 * 60 * 1000)) {
        setSpan(elem, moment(ts).calendar())
      } else {
        setSpan(elem, moment(ts).fromNow())
      }
    }
  }
}, 10 * 1000)

setInterval(() => {
  // 1 minute
  let now = Date.now()
  if ((now - latestPost) < (1 * 60 * 1000)) {
    let spans = [...document.querySelectorAll('span.ts')].reverse()
    for (var i = 0; i < spans.length; i++) {
      let elem = spans[i]
      let ts = +elem.getAttribute('ts')
      if (now - ts > (10 * 60 * 1000)) {
        return // Anything that far back is already set
      }
      setSpan(elem, moment(ts).calendar())
    }
  }
}, 1 * 60 * 1000)

setInterval(() => {
  // 10 minutes

}, 1 * 60 * 1000)
