const express = require('express'); 
const mysql = require('mysql');  //MySQLを使う用
const session = require("express-session"); //セッションする用
const bcrypt = require('bcrypt'); //パスワード暗号化用
const res = require('express/lib/response');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'k2yanagi',
  database: 'Koasuky'
});

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);

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
    (error_i, results_i) => {
      console.log(results_i);
      //res.render('index.ejs', {items: results}); //items配列に商品情報がすべて格納（idの低い順)
  
    connection.query(
      "SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY id DESC LIMIT 3", //purchased_countの多いものから3つの情報を取得
      (error_r, results_r) => {
        console.log(results_r);
        res.render("index.ejs", {items: results_i, ranks: results_r}); //ranks配列にpurchased_countの多いものから3つの情報を格納（purchased_countの大きい順）
      });
  });
});


// 内容画面に対応するルーティングです
app.get('/content/:id', (req, res) => {
  const itemId = req.params.id; //ルートパラメータから取得したidをitemIdへ
  connection.query(
    'SELECT * FROM clothes WHERE id = ?',
    [itemId],
    (error, results) => {
      console.log(results);
      res.render('content.ejs', { item: results[0] });
    });
});

//カートに入れるボタンを押したときに対応するルーティングです
app.post("/add", (req, res) => {
  const itemId = req.params.id;
  const userId = req.session.userId;
  connection.query(
    "INSERT INTO customers (cart) VALUES (?) WHERE id = ?", //お客のIDからcart情報を取得
    [itemId, userId],
    (error, results) => {
      console.log("itemId: %d",itemId);
      res.redirect("/content/:id");
    });
});

// アバウト画面に対応するルーティングです
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

//ログイン画面に対応するルーティングです
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

// パスワード忘れた画面に対応するルーティングです
app.get('/password', (req, res) => {
  res.render('password.ejs');
});

//新規登録画面に対応するルーティングです
app.get("/signup", (req, res) => {
  res.render("signup.ejs")
});  

//カート画面に対応するルーティングです
app.get("/cart", (req, res) => {
  const userId = req.session.userId;
  connection.query(
    'SELECT cart FROM customers WHERE id = ?',
    [userId],
    (error, results) => {
      res.render('cart.ejs', { carts: results });
    }
  );
}); 

app.post("/purchase", (req, res) => {
  const userId = req.session.userId;
  const purchase_counts = req.body.purchase_count; //今回お客が買う商品のそれぞれの個数(配列にする)
  var counter = 0; //何回繰り返しているか数える用
  purchase_counts.forEach((count) => {
    counter++;
    connection.query(
      "UPDATE clothes SET purchased_count = purchased_count + ? WHERE id = ( SELECT cart FROM customers WHERE id = ?)",
      // 上のSQLでは、データベースclothesのpurchased_countの値をお客が買った分だけ増やす（未完成）
      [count, userId],
      (error_p, results_p) => {
        if(counter == purchase_counts.length){ //最後の繰り返しなら、cartの中身を空（NULL）にしてHOMEに戻る
        connection.query(
          "UPDATE customers SET cart = NULL WHERE id = ?"
          [userId],
          (error_c, results_c) => {
            res.redirect("/purchased");
          });
        }
      });
  });
});

//購入完了画面に対応するルーティングです
app.get("/purchased", (req, res) => {
  res.render("purchased.ejs");
}); 

// 問い合わせ画面に対応するルーティングです
app.get('/contact', (req, res) => {
  res.render('contact.ejs');
});

//問い合わせ画面で送信ボタンを押した時に対応するルーティングです
app.post("/contact_submit", (req, res) => {
  const name = req.body.name; 
  const email = req.body.email;
  const title = req.body.title;
  const contents = req.body.contents;

  connection.query(
    "INSERT INTO contacts (name, email, title contents) VALUES (?, ?, ?, ?)",
    [name, email, title, contents],
    (error, results) => {
      res.redirect("/");
    }
  );
});

app.listen(3000);