// Install required packages by:
// npm install express ejs mongodb body-parser

"use strict";

let express = require('express');
let app     = express();
let parser  = require('body-parser');
let mongo   = require('mongodb').MongoClient;
let crypto  = require('crypto');
let tokens  = [];

app.engine('html', require('ejs').renderFile);
app.use(parser.urlencoded({extended: true}));
app.use(CookieManager);
app.use(express.static('public'));

app.get ('/',         (req, res) => res.render('index.html')    );
app.get ('/register', (req, res) => res.render('register.html') );
app.get ('/login',    (req, res) => res.render('login.html')    );

app.get ('/logout',   (req, res) => {
	delete tokens[req.cookies['Token']];
	res.redirect('/');
});

app.get ('/settings',  (req, res) => {
	if (tokens[req.cookies['Token']] == null) {
		res.redirect('/login');
	} else {
		res.render('settings.html');
	}
});

app.post('/register', (req, res) => {
	mongo.connect('mongodb://localhost:27017/app1', (error, database) => {
		database
		.collection('users')
		.find({email:req.body.email})
		.toArray((error, result) => {
			if (result.length == 0) {
				database.collection('users').insert({
					email:    req.body.email,
					name:     req.body.name,
					password: encrypt(req.body.password)
				});
			}
			res.redirect('/');
		});
	});
});

app.post('/login', (req, res) => {
	mongo.connect('mongodb://localhost:27017/app1', (error, database) => {
		database
		.collection('users')
		.find({email:req.body.email, password: encrypt(req.body.password)})
		.toArray((error, result) => {
			if (result.length == 1) {
				tokens[req.cookies['Token']] = result[0];
				res.redirect('/profile');
			} else {
				delete tokens[req.cookies['Token']];
				res.redirect('/login');
			}
		});
	});
});

app.listen(1200);

function encrypt(password) {
	return crypto.createHash('sha256').update(password).digest('hex');
}

const COOKIE_TIME = 30 * 60000; // 30 minutes
function CookieManager(req, res, next) {
	let time = Date.now();

	if (req.headers['cookie'] != null) {
		req.cookies = {};
		let pairs = req.headers['cookie'].split(';');
		for (let i = 0; i < pairs.length; i++) {
			let fields = pairs[i].split('=');
			req.cookies[fields[0]] = fields[1];
		}
	}

	if (req.headers['cookie'] == null ||
		req.cookies['Token'] == null) {
		req.cookies = {};
		req.cookies['Token'] = time + '-' +
			parseInt(Math.random() * 1000000000000);
	}

	res.set('Set-Cookie', 'Token=' + req.cookies['Token'] +
		'; Expires=' + new Date(time + COOKIE_TIME).toUTCString());

	next();
}
