const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); dotenv.config();
//const http = require('http');

const bent = require('bent')
const getJSON = bent('json')

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

const options = {
	key: fs.readFileSync('server-key.pem'),
	cert: fs.readFileSync('server-crt.pem'),
	ca: fs.readFileSync('ca-crt.pem'),
	requestCert: true,
	rejectUnauthorized: true
};

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const server = https.createServer(options, app)

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/home', (req, res) => {
	res.sendFile(path.join(__dirname, './public/home.html'));
});

app.post('/login', async function (req, res) {

	if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
		return res.json({ "responseError": "something goes to wrong" });
	}
	const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

	let captcha = await getJSON(verificationURL);

	if (captcha.success !== undefined && captcha.success && captcha.score > 0.1 && req.body.name === "a" && req.body.password === "a")
		res.redirect("/home")
	else
		res.redirect("/")


});

server.listen(port, hostname, function () {
	console.log("server is listening at " + hostname + " on port: " + port);
});