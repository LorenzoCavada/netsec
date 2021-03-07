const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');
const request = require('request');
//const http = require('http');

const bent = require('bent')
const getJSON = bent('json')

const hostname = '127.0.0.1';
const port = 3000;

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
	const secretKey = "6LcI_28aAAAAAP9SgZOp_mvBaT3kuX8tTqp-d2bV";
	let pass = true;

	const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

	let captcha = await getJSON(verificationURL);

	if (captcha.success !== undefined && captcha.success && captcha.score > 0.1 && req.body.name === "a" && req.body.password === "a")
		res.redirect("/home")
	else
		res.redirect("/", {msg: "Username or password incorrect"})


});

server.listen(port, hostname, function () {
	console.log("server is listening on port: 3000");
});