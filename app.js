const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const member = require('./routes/member.route');
const schedule = require('./routes/schedule.route');
const meeting = require('./routes/meeting.route');
const facility = require('./routes/facility.route');
const mongoose = require('mongoose');

const path = require('path');
global.Root = __dirname;
global.Folders = Root.split(path.sep);
global.PackageName = Folders[Folders.length - 1];

// default port setting
let port = 7010;

/*
process any command line parameters.
case is significant.
  valid parameters: 
    -p | --port   <port number>
*/

var argvs = require('optimist').argv;
var index,
  value;
for (index in argvs) {
  if (argvs.hasOwnProperty(index)) {
    value = argvs[index];
    if (index === "p" || index === "port")
      port = value;
  }
}

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // globally disable autoIndex 
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

let dev_db_url = 'mongodb://localhost/tssg-tech';
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, options);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log(dev_db_url + " - we're connected!");
  console.log();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/members', member);
app.use('/schedules', schedule);
// app.use('/meetings', meeting);
app.use('/facilities', facility);

/*
  The router will look in the supplied folder for any asked page.
  Express looks up the files reative to the static directory, so
  the name of the static directory is notpart of the URL.
  In the below case, the folder would be <root>/public so the
  request would be '/' or '/<file>' or '/<path/<file>.
  If not found, it will default to index.html.

  See https://expressjs.com/en/starter/static-files.html
  for more information.
*/

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log('Server is up and running on port number ' + port);
});