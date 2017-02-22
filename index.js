const bongBong = require('./components/bong-bong')
const qs = require('qs')
module.exports = bongBong

if (process.browser) {
  window.searchParams = qs.parse(window.location.search.slice(1))
  window.bongBong = bongBong
}
