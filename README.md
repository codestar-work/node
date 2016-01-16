# Node.js Demo App

- ตัวอย่างการสร้าง Web ด้วย MongoDB, Express.js, Angular 2 และ Node.js

- ก่อนใช้งานต้องติดตั้ง packages ที่จำเป็นด้วยคำสั่ง
```
npm install express ejs mongodb body-parser cookie-parser
```
- จากนั้นใช้คำสั่ง node app.js แล้วเปิด browser ไปที่ localhost:1200

- ใช้ express เพื่อให้เขียน URL routing ได้ง่ายขึ้น
- ใช้ body-parser สำหรับรับข้อมูลผ่าน HTTP Post
- ระบบมีการใช้ mongodb เพื่อเก็บข้อมูลผู้ใช้
- ใช้ crypto เพื่อเข้ารหัสรหัสผ่าน
- ใช้ EJS ในการ render หน้า HTML
```javascript
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
```

- Static content เก็บไว้ใน folder ชื่อ public ดังนั้นต้องบอกให้ Express.js รู้ด้วยคำสั่ง use()
```javascript
app.use(express.static('public'));
```

- บางหน้าจะเข้าถึงได้ทันที เช่น / หรือ /login หรือ /register
```javascript
app.get ('/',         (req, res) => res.render('index.html')    );
app.get ('/register', (req, res) => res.render('register.html') );
app.get ('/login',    (req, res) => res.render('login.html')    );
```

- แต่บางหน้า เช่น /settings ถ้ายังไม่ได้ login ระบบจะ redirect ไปหน้า /login
```javascript
app.get ('/settings',  (req, res) => {
	if (req.cookies == null ||
		req.cookies.token == null ||
		tokens[req.cookies.token] == null) {
		res.redirect('/login');
	} else {
		res.render('settings.html');
	}
});
```

- การสร้าง Token จากเลขสุ่มและเวลาหน่วยมิลลิวินาที เช่น
```javascript
let token = Date.now() + '-' +
	parseInt(Math.random() * 1000000000000);
```

- การใส่ Token ลงไปใน Cookie
```javascript
res.cookie('token', token, {maxAge: 20 * 60000});
```
หรือ
```javascript
res.set('Set-Cookie', 'token=' + token);
```

- ใช้ MongoDB ในการทำงานใน collection ชื่อ users ตัวอย่างการสร้างผู้ใช้ใหม่
```javascript
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
```

- ใช้การเข้ารหัส รหัสผ่าน แบบ SHA-256 ด้วยคำสั่ง
```javascript
let crypto  = require('crypto');
crypto.createHash('sha256').update(password).digest('hex')
```

- ในอนาคตจะมี Angular 2, MySQL & Bootstrap ด้วย
