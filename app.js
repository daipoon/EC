const express = require('express'); 
const mysql = require('mysql');  //MySQLを使う用
const session = require("express-session"); //セッションする用
const bcrypt = require('bcrypt'); //パスワード暗号化用
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'progate',
  password: 'password',
  database: 'blog'
});

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);

//ログインの状態を毎回確認します
app.use((req, res, next) => {
    if (req.session.userId === undefined) {
            console.log('ログインしていません');
        } else {
            console.log('ログインしています');
        }
    next();
});

// トップ画面に対応するルーティングです
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// 内容画面に対応するルーティングです
app.get('/content/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM articles WHERE id = ?',
    [id],
    (error, results) => {
      res.render('content.ejs', { cloth: results[0] });
    }
  );
});

//ログイン画面に対応するルーティングです
app.get('/login', (req, res) => {
    connection.query(
      'SELECT * FROM customers',
      (error, results) => {
        res.render('list.ejs', { customers: results });
      }
    );
});

//新規登録画面に対応するルーティングです
app.get("/signup", (req, res) => {
  
});  

//カート画面に対応するルーティングです
app.get("/cart", (req, res) => {
  const purchased_count = ;
  connection.query(
    'INSERT INTO customers (purchased_count) VALUES (?)',
    [purchased_count],
    (error, results) => {
      res.render('list.ejs', { customers: results });
    }
  );
}); 

//購入完了画面に対応するルーティングです
app.get("/purchased", (req, res) => {
  res.render("purchased.ejs");
}); 

app.listen(3000);