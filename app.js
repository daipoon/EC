const express = require('express'); 
const mysql = require('mysql');  //MySQLを使う用
const session = require("express-session"); //セッションする用
const bcrypt = require('bcrypt'); //パスワード暗号化用
const res = require('express/lib/response');
const app = express();
const nodemailer = require('nodemailer');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: 'iyGYWq5ohbRk11111111111',
  consumer_secret: '6FV5MOxbwbRkYew111111111111111111111111111111111',
  access_token_key: '982942500309483521-111111111111111111111111111111111',
  access_token_secret: 'r1CQ4gIqR59U2Qa111111111111111111111111111111111'
});

function tweetPost(content) {
  client.post('statuses/update', {status: content}, function(error, tweet, response) {
    if (!error) {
      console.log("tweet success: " + content);
    } else {
      console.log(error);
    }
  });
}

const options = {
  host: 'smtp.gmail.com', // メールサーバー
  port: 465, // ポート番号 25 など
  secure: true, // 465 番ポートを使う場合。それ以外は false
  requireTLS: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: { // 認証情報
    user: 'daichan.server123@gmail.com', // ユーザー名
    pass: 'pntkzrdjulnukzhu', // パスワード
  },
};

function send(text1,number) {
  const email = {
    from: 'daichan.server123@gmail.com', // 送信元メールアドレス
    to: text1, // 送信先メールアドレス
    subject: 'Koasuky会員登録 認証コード',
    html: 'パスコード: ' + number + '<br>このコードを認証コード欄に記入してください。',
    }
  const transport = nodemailer.createTransport(options);
  const result = transport.sendMail(email);
};

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'k2yanagi',
  database: 'koasuky'
});

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);

app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    res.locals.username = undefined;
  } else {
    res.locals.username = req.session.username;
  }
  next();
});

app.use((req, res, next) => {
  if (req.session.email === undefined) {
    res.locals.email = undefined;
  } else {
    res.locals.email = req.session.email;
  }
  next();
});

//ログインの状態を毎回確認します
app.use((req, res, next) => {
    if (req.session.userId === undefined){
            console.log('ログインしていません');
        } else {
            console.log('ログインしています');
        }
    next();
});

// トップ画面に対応するルーティングです
app.get('/', (req, res) => {
  connection.query(
    'SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY released_at DESC', //発売日が最近のものからsize以外の情報を取得
    (error_i, results_i) => {
      // console.log(results_i);
      //res.render('index.ejs', {items: results}); //items配列に商品情報がすべて格納（idの低い順)
  
    connection.query(
      "SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY id DESC LIMIT 3", //purchased_countの多いものから3つの情報を取得
      (error_r, results_r) => {
        // console.log(results_r);
        res.render("index.ejs", {items: results_i, ranks: results_r, search_word: undefined}); //ranks配列にpurchased_countの多いものから3つの情報を格納（purchased_countの大きい順）
      });
  });
});

// トップ画面に対応するルーティングです
app.post('/', (req, res) => {
  const check_Tshirt = req.body.cb_T_shirt;
  const check_Tshirtlong = req.body.cb_T_shirt_long;
  const check_sweat = req.body.cb_sweat;
  const check_sweatshirt = req.body.cb_sweat_shirt;
  const check_cap = req.body.cb_cap;
  
  const search_word = req.body.search_word;
  console.log(search_word);

  let check_count = 0
  let category_list = []
  // console.log(check_Tshirt)

  if(check_Tshirt !== undefined){
    check_count++;
    category_list.push("T-shirt");
  }
  if(check_Tshirtlong !== undefined){
    check_count++;
    category_list.push("T-shirt-long");
  }
  if(check_sweat !== undefined){
    check_count++;
    category_list.push("sweat");
  }
  if(check_sweatshirt !== undefined){
    check_count++;
    category_list.push("sweat-shirt");
  }
  if(check_cap !== undefined){
    check_count++;
    category_list.push("cap");
  }
  console.log(check_count);
  console.log(category_list);

  if(check_count > 0){
    let item_list = []
    for (let i=0; i<check_count; i++){
      // console.log(i);
      // console.log(category_list[i]);
      connection.query(
        'SELECT id, name, price, category, purchased_count, released_at FROM clothes where category=? ORDER BY released_at DESC', //発売日が最近のものからsize以外の情報を取得
        [category_list[i]],
        (error, results) => {
          // console.log(results);
          item_list.push(results);
          if(i === check_count-1){
            item_list = [].concat.apply([], item_list)
            console.log(item_list);
            res.render("index.ejs", {items: item_list, ranks: null, search_word: search_word});
          }
      });
    }
  }
  else if(check_count === 0){
    connection.query(
      "SELECT id, name, price, category, purchased_count, released_at FROM clothes ORDER BY id DESC LIMIT 3", //purchased_countの多いものから3つの情報を取得
      (error, results) => {
        // console.log(results);
        res.render("index.ejs", {items: null, ranks: results, search_word: search_word}); //ranks配列にpurchased_countの多いものから3つの情報を格納（purchased_countの大きい順）
    });
  }
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
app.post("/add/:id", (req, res) => {
  const itemId = req.params.id;
  const userId = req.session.userId;
  connection.query(
    "SELECT cart1, cart2, cart3, cart4, cart5 FROM customers WHERE id = ?",
    [userId],
    (error, results_carts) => {
      const carts = results_carts[0];
      console.log(carts);
      for (let cart in carts){
        if(carts[cart] == null){
          connection.query(
            `UPDATE customers SET ${cart} = ? WHERE id = ?`, //お客のIDからcart情報を取得
            [itemId, userId],
            (error, results) => {
              console.log("itemId: %d\nuserId: %d",itemId, userId);
              console.log(results);
              res.redirect("back");
            });
            break;
          }
        }
    });
});

//カート画面に対応するルーティングです
app.get("/cart", (req, res) => {
  const userId = req.session.userId;
  let results_item_list = [];
  connection.query(
    'SELECT cart1, cart2, cart3, cart4, cart5 FROM customers WHERE id = ?',
    [userId],
    (error, results_cart) => {
      for (let cart in results_cart[0]){
        let itemId = results_cart[0][cart];
        connection.query(
          'SELECT * FROM clothes WHERE id = ?',
          [itemId],
          (error, results_item) => {
            // console.log(results_item[0]);
            results_item_list.push(results_item[0]);
            if(cart == "cart5") res.render('cart.ejs', { carts_list: results_item_list });
        });
      }
    });
});

//カートから削除ボタンを押したときに対応するルーティングです
app.post("/delete_item/:id", (req, res) => {
  const cartId = req.params.id;
  const userId = req.session.userId;
  connection.query(
    `UPDATE customers SET cart${cartId} = null WHERE id = ?`,
    [userId],
    (error, results_carts) => {
      res.redirect("back");
    });
});

app.post("/purchase", (req, res) => {
    const userId = req.session.userId;
    connection.query(
      "UPDATE customers SET cart1=null, cart2=null, cart3=null, cart4=null, cart5=null WHERE id = ?",
        [userId],
        (error, results) => {
          res.redirect("/purchased");
    });
});

// app.post("/purchase", (req, res) => {
//     const userId = req.session.userId;
//     const purchase_counts = req.body.purchase_count; //今回お客が買う商品のそれぞれの個数(配列にする)
//     var counter = 0; //何回繰り返しているか数える用
//     purchase_counts.forEach((count) => {
//         counter++;
//         connection.query(
//           "UPDATE clothes SET purchased_count = purchased_count + ? WHERE id = ( SELECT cart FROM customers WHERE id = ?)",
//           // 上のSQLでは、データベースclothesのpurchased_countの値をお客が買った分だけ増やす（未完成）
//           [count, userId],
//           (error_p, results_p) => {
//             if(counter == purchase_counts.length){ //最後の繰り返しなら、cartの中身を空（NULL）にしてHOMEに戻る
//               connection.query(
//                 "UPDATE customers SET cart = NULL WHERE id = ?"
//                 [userId],
//                 (error_c, results_c) => {
//                   res.redirect("/purchased");
//               });
//             }
//         });
//     });
// });

//購入完了画面に対応するルーティングです
app.get("/purchased", (req, res) => {
res.render("purchased.ejs");
}); 

// アバウト画面に対応するルーティングです
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

//ログイン画面に対応するルーティングです
app.get('/login', (req, res) => {
  res.render('login.ejs',{ errors: []});
});

//ログイン画面のパスワードの整合性を確認する
app.post('/login',(req,res) => {
  const email = req.body.email;
  const errors = [];
  connection.query(
    'SELECT * FROM customers WHERE email = ?',
    [email],
    (error,results) => {
      console.log(email);
      console.log(req.body.password);
      if (results.length > 0) {
        if (bcrypt.compareSync(req.body.password, results[0].password) == true){
          req.session.userId = results[0].id;
          req.session.username = results[0].name;
          res.redirect('/');
        } else {
          console.log("error1");
          errors.push("メールアドレスとパスワードが一致しません。")
          res.render('login.ejs', { errors: errors });
        }
      } else {
        console.log("error2");
        errors.push("メールアドレスが存在しません。")
        res.render('login.ejs', { errors: errors });
      }
    }
  );
});

//会員情報登録画面に関するルーティング
app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register',(req,res,next) => {
  var pattern = /^(?=.*[A-Z])[a-zA-Z0-9.?/-]{8,24}$/;
  const pass = req.body.newpassword; 
  const passcheck = req.body.passwordcheck;   
  const name = req.body.username;
  const errors = [];    
  if(pass === "") {
    errors.push("パスワードが入力されていません。");    
  } else if (pattern.test(pass) === false) {
    errors.push("パスワードは8-24字で、大文字が少なくとも1つ含まれる必要があります"); 
  } else if(pass !== passcheck) {
    errors.push("確認用パスワードと一致しません");    
  }
  if(name === "") {
    errors.push("ユーザー名が入力されていません。");        
  }
  if(errors.length > 0) {
    res.render('register.ejs', { errors: errors });    
  } else {
    next();
  }
},
(req,res) => {
  const pass = req.body.newpassword; 
  const name = req.body.username;
  let hashed_password = bcrypt.hashSync(pass, 10);
  console.log(hashed_password);
  connection.query (
    'INSERT INTO customers (name,email,password) VALUES (?, ?, ?)',
    [name,req.session.email,hashed_password],
    (error,results) => {
    req.session.username = name;
    req.session.userId = results.insertId;
    res.redirect('/'); 
  });
  }
); 

// パスワード忘れた画面に対応するルーティングです
app.get('/password', (req, res) => {
  res.render('password.ejs');
});

//認証パスワード確認画面に対応するルーティング
app.get('/passcord', (req, res) => {
  res.render('passcord.ejs');
});

//認証パスワードの整合性を確認する
app.post("/passcord", (req, res) => {
    const errors = [];
    let pass = req.body.passcord;
    let emailpass = req.session.passcord;
    if(pass == emailpass) {
      res.render('register.ejs', { errors: errors });     
    } else {
      console.log("passcord is not correct");
      console.log(emailpass);
      console.log(pass);
      errors.push("パスコードが正しくありません。");
      res.render('passcord.ejs', { errors: errors });
  };  
});

//新規登録画面に対応するルーティングです
app.get('/signup', (req, res) => {
  const errors = [];
  res.render('signup.ejs', { errors: errors });  
});

//新規登録のメールアドレス仮登録に対応
app.post("/signup",(req,res) => {
  console.log("check1");
  var pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
  const errors = [];
  const email = req.body.signupemail;
  const check = req.body.signupcheck;
  console.log(email);
  console.log(check);
  console.log(pattern.test(email));
  connection.query (
    'SELECT * FROM customers WHERE email = ?',
    [email],
    (error,results) => {
      if(check === undefined) {
        errors.push("ストアの規約・プライバシーポリシーに同意していません。")
      } 
      if(results.length > 0) { // これemail全部と一個一個比較できてる？
        errors.push("既に登録されているメールアドレスです"); 
      } 
      if(email === "") {
        errors.push("メールアドレスを入力してください。")
      } else if (pattern.test(email) === false) {
        errors.push("正しいメールアドレスを入力してください。")        
      }      
      if(errors.length > 0) {  
        res.render('signup.ejs', { errors: errors });  
      } else {
        const number = Math.floor(Math.random() * (999999 + 1 - 100000)) + 100000;
        req.session.passcord = number;
        req.session.email = email;
        console.log(req.session.passcord);
        res.render('passcord.ejs',{ errors: errors });  
        send(email,number);
      }
    });
  }
);

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
    "INSERT INTO contacts (name, email, title, contents) VALUES (?, ?, ?, ?)",
    [name, email, title, contents],
    (error, results) => {
      res.redirect("/");
    }
  );
});

app.listen(process.env.PORT || 3000);
// http://localhost:3000/
