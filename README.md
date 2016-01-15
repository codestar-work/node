# Node.js Demo App

- ตัวอย่างการสร้าง Web ด้วย MongoDB, Express.js, Angular 2 และ Node.js

- ก่อนใช้งานต้องติดตั้ง packages ที่จำเป็นด้วยคำสั่ง
```
npm install express ejs mongodb body-parser
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
let parser  = require('body-parser');
let mongo   = require('mongodb').MongoClient;
let crypto  = require('crypto');
let tokens  = [];

app.engine('html', require('ejs').renderFile);
app.use(parser.urlencoded({extended: true}));
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
	if (tokens[req.cookies['Token']] == null) {
		res.redirect('/login');
	} else {
		res.render('settings.html');
	}
});
```

- อย่าลืมต้องมี middleware สำหรับจัดการ Cookie ด้วย
```javascript
app.use(CookieManager);


function CookieManager(req, res, next) {
  const COOKIE_TIME = 30 * 60000; // 30 minutes
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

```

- ใช้ Token โดยสร้างจากเลขสุ่มและเวลาหน่วยมิลลิวินาที เช่น
```javascript
req.cookies = {};
req.cookies['Token'] = Date.now() + '-' +
	parseInt(Math.random() * 1000000000000);
```

- Token มีอายุ 30 นาทีกำหนดโดย
```javascript
res.set('Set-Cookie', 'Token=' + req.cookies['Token'] +
	'; Expires=' + new Date(time + COOKIE_TIME).toUTCString());
```



- ใช้ MongoDB ในการทำงานใน collection ชื่อ users

- ใช้การเข้ารหัส รหัสผ่าน แบบ SHA 256 ด้วยคำสั่ง
```javascript
let crypto  = require('crypto');
crypto.createHash('sha256').update(password).digest('hex')
```





- ในอนาคตจะมี Angular 2, MySQL & Bootstrap ด้วย
