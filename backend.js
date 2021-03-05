const express = require('express');
const port = process.env.PORT || 3000;
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


const getRSVPList = () => {
    const opts = {
      columns: true,
      skip_empty_lines: true,
      trim: true
    };

    const file = fs.readFileSync(path.resolve(__dirname, `./rsvp.csv`), "utf-8");

    return parse(file, opts);
  }

function fullTime(n) { return n < 10 ? "0" + n : n }

const getTimeNow = () => {
  let date = new Date();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let seconds = date.getSeconds();
  hour = fullTime(hour);
  minute = fullTime(minute);
  seconds = fullTime(seconds); 
  return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + " " +  hour + ":" + minute + ":" + seconds;
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(JSON.stringify(getRSVPList(), null, 2));
});

app.get('/checkin', (req, res) => {
  res.send(JSON.stringify(JSON.parse(fs.readFileSync("./checkedin.json", "utf-8")), null, 2));
});

app.post('/checkin', (req, res) => {
  const checkedin = JSON.parse(fs.readFileSync("./checkedin.json", "utf-8"));
  checkedin
    .filter(g => {
      return g.name === req.body.name && 
             g.placecard === req.body.placecard && 
             g.food === req.body.food && 
             g.table === req.body.table;
    })
    .forEach(guest => {
      guest.checkin = getTimeNow()
    });
  fs.writeFileSync("./checkedin.json", JSON.stringify(checkedin, null, 2));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})