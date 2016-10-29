const shaolin = require('../../funky')
const emojione = require('emojione')

shaolin`
<bong-bong-message>
  <div>${ doc => doc.renderedText }</div>
</bong-bong-message>
`
