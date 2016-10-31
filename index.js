const bongBong = require('./components/bong-bong')
module.exports = bongBong

if (process.browser) {
  window.bongBong = bongBong
}
