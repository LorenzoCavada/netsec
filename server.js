const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); dotenv.config();
//const http = require('http');

const bent = require('bent'); const getJSON = bent('json');

const hostname = process.env.HOSTNAME; const port = process.env.PORT;

let isLogged = false;

const options = {
	key: fs.readFileSync('server-key.pem'),
	cert: fs.readFileSync('server-crt.pem'),
	ca: fs.readFileSync('ca-crt.pem'),
	requestCert: true,
	rejectUnauthorized: true
};

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public/img/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
const server = https.createServer(options, app)

app.get('/', (req, res) => {
	if (isLogged)
		res.render(path.join(__dirname, './public/home.ejs'));
	else
		res.render(path.join(__dirname, './public/index.ejs'));
});

app.get('/home', (req, res) => {
	if (isLogged)
		res.render(path.join(__dirname, './public/home.ejs'));
	else
		res.render(path.join(__dirname, './public/index.ejs'));
});

app.post('/login', async function (req, res) {

	if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
		return res.json({ "responseError": "something goes to wrong" });
	}
	const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

	let captcha = await getJSON(verificationURL);

	if (captcha.success !== undefined && captcha.success && captcha.score > 0.1 && req.body.name === "admin" && req.body.password === "admin") {
		res.render(path.join(__dirname, './public/home.ejs'));
		isLogged = true;
	} else {
		res.render(path.join(__dirname, './public/index.ejs'), {error: "WARNING: Login failed, try again!"});
		isLogged = false;
	}
});

app.get('/logout', (req, res) => {
	isLogged = false;
	res.render(path.join(__dirname, './public/index.ejs'));
});

server.listen(port, hostname, function () {
	console.log("server is listening at " + hostname + " on port: " + port);
});

