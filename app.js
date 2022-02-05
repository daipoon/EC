const express = require('express'); 
const mysql = require('mysql');  //MySQLを使う用
const session = require("express-session"); //セッションする用
const bcrypt = require('bcrypt'); //パスワード暗号化用
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'k2yanagi',
  database: 'Koasuky'
});

app.set('views', './views');
app.set('view engine', 'ejs');

/*
app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);
*/

//ログインの状態を毎回確認します
/*
app.use((req, res, next) => {
    if (req.session.userId === undefined)
            console.log('ログインしていません');
        } else {
            console.log('ログインしています');
        }
    next();
});
*/

// トップ画面に対応するルーティングです
app.get('/', (req, res) => {
  connection.query(
    'SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY released_at DESC', //発売日が最近のものからsize以外の情報を取得
    (error, results) => {
      console.log(results);
      res.render('index', {items: results}); //items配列に商品情報がすべて格納（idの低い順）
    }
  );
  connection.query(
    "SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY purchased_count DESC LIMIT 3;", //purchased_countの多いものから3つの情報を取得
    (error, results) => {
      console.log(results);
      res.render("index", {ranks: results}) //ranks配列にpurchased_countの多いものから3つの情報を格納（purchased_countの大きい順）
    }
  )
});

// 内容画面に対応するルーティングです
/*
app.get('/content/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM clothes WHERE id = ?',
    [id],
    (error, results) => {
      res.render('content.ejs', { cloth: results[0] });
    }
  );
});
*/

// アバウト画面に対応するルーティングです
/*
app.get('/about', (req, res) => {
  res.render('about.ejs');
});
//ログイン画面に対応するルーティングです
app.get('/login', (req, res) => {
    connection.query(
      'SELECT * FROM customers',
      (error, results) => {
        res.render('login.ejs', { customers: results });
      }
    );
});
*/

// パスワード忘れた画面に対応するルーティングです
/*
app.get('/password', (req, res) => {
  res.render('password.ejs');
});
*/

//新規登録画面に対応するルーティングです
/*
app.get("/signup", (req, res) => {
  
});  
*/

//カート画面に対応するルーティングです
/*
app.get("/cart", (req, res) => {
  connection.query(
    'INSERT INTO customers (purchased_count) VALUES (?)',
    [purchased_count],
    (error, results) => {
      res.render('cart.ejs', { customers: results });
    }
  );
}); 
*/

//購入完了画面に対応するルーティングです
/*
app.get("/purchased", (req, res) => {
  res.render("purchased.ejs");
}); 
*/

// 問い合わせ画面に対応するルーティングです
/*
app.get('/contact', (req, res) => {
  res.render('contact.ejs');
});
*/

app.listen(3000);