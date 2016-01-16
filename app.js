"use strict";

let express = require('express');
let app     = express();
let body    = require('body-parser');
let cookie  = require('cookie-parser');
let mongo   = require('mongodb').MongoClient;
let crypto  = require('crypto');
let tokens  = [];

app.engine('html', require('ejs').renderFile);
app.use(body.urlencoded({extended: true}));
app.use(cookie());
app.use(express.static('public'));

app.get ('/',         (req, res) => res.render('index.html')    );
app.get ('/register', (req, res) => res.render('register.html') );
app.get ('/login',    (req, res) => res.render('login.html')    );

app.get ('/logout',   (req, res) => {
	delete tokens[req.cookies.token];
	res.redirect('/');
});

app.get ('/settings',  (req, res) => {
	if (req.cookies == null ||
		req.cookies.token == null ||
		tokens[req.cookies.token] == null) {
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
				let token = Date.now() + '-' +
					parseInt(Math.random() * 1000000000000);
				tokens[token] = result[0];
				res.cookie('token', token, {maxAge: 60000});
				res.redirect('/settings');
			} else {
				res.redirect('/login');
			}
		});
	});
});

app.listen(1200);

function encrypt(password) {
	return crypto.createHash('sha256').update(password).digest('hex');
}
