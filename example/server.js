const express = require('express');
const joiSwagger = require('./joiSwagger');

const app = express();

app.use('/ping', (req, res) => res.send('pong'));

app.use('/api', require('./routes/foo'));

joiSwagger.assignDefinition({
  definitions: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        firstName: { type: 'string' }
      }
    }
  }
});

joiSwagger.wrapRouter(app).listen(8000, () => console.log('listening on port 8000'));
