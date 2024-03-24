const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT;
const routes = require('./routes');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

app.use(routes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'success', status: 200 });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
