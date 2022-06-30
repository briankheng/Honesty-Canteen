require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const _ = require("lodash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser("Secret"));
app.use(
  session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin:hjoF8iLTzoJAkJGp@cluster0.cf6pxwy.mongodb.net/storeDB");

const itemSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: String,
  time: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const balanceSchema = new mongoose.Schema({
  balance: Number,
});

const userSchema = new mongoose.Schema({});
userSchema.plugin(passportLocalMongoose);

const Item = mongoose.model("Item", itemSchema);
const Balance = mongoose.model("Balance", balanceSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

app
  .route("/")
  .get((req, res) => {
    Item.find({})
      .sort({ time: -1 })
      .exec((err, items) => {
        items.forEach((item) => {
          item.name = _.startCase(item.name);
        });
        if (req.isAuthenticated()) {
          res.render("store", { items: items, info: "logout" });
        } else {
          res.render("store", { items: items, info: "login" });
        }
      });
  })
  .post(upload.single("image"), (req, res) => {
    if (req.body.filter === "new") {
      Item.find({})
        .sort({ time: -1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          if (req.isAuthenticated()) {
            res.render("store", { items: items, info: "logout" });
          } else {
            res.render("store", { items: items, info: "login" });
          }
        });
    } else if (req.body.filter === "old") {
      Item.find({})
        .sort({ time: 1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          if (req.isAuthenticated()) {
            res.render("store", { items: items, info: "logout" });
          } else {
            res.render("store", { items: items, info: "login" });
          }
        });
    } else if (req.body.filter === "ascName") {
      Item.find({})
        .sort({ name: 1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          if (req.isAuthenticated()) {
            res.render("store", { items: items, info: "logout" });
          } else {
            res.render("store", { items: items, info: "login" });
          }
        });
    } else if (req.body.filter === "dscName") {
      Item.find({})
        .sort({ name: -1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          if (req.isAuthenticated()) {
            res.render("store", { items: items, info: "logout" });
          } else {
            res.render("store", { items: items, info: "login" });
          }
        });
    } else {
      if (req.isAuthenticated()) {
        const obj = {
          name: _.toLower(req.body.productName),
          desc: req.body.description,
          price: parseInt(req.body.price).toLocaleString("en-US"),
          time: String(
            new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            })
          ),
          img: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        };
        Item.create(obj, (err, item) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.redirect("/login");
      }
    }
  });
app.post("/delete", (req, res) => {
  if (req.isAuthenticated()) {
    Item.deleteOne({ _id: req.body.deleteID }, (err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/login");
  }
});
app
  .route("/balance-box")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      Balance.find((err, balances) => {
        if (balances.length === 0) {
          const balance = new Balance({
            balance: 0,
          });
          balance.save();
          res.redirect("/balance-box");
        } else {
          const message = req.flash("message");
          res.render("balance", {
            balance: balances[0].balance.toLocaleString("en-US"),
            message,
          });
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    Balance.findOne((err, balance) => {
      let befBalance = balance.balance;
      let curBalance = balance.balance;
      if (req.body.info === "add") {
        curBalance += parseInt(req.body.add);
        Balance.deleteOne({ balance: befBalance }, (err) => {
          if (!err) {
            const balance = new Balance({
              balance: curBalance,
            });
            balance.save();
            req.flash("message", "Success");
            setTimeout(() => res.redirect("/balance-box"), 50);
          }
        });
      } else if (req.body.info === "withdraw") {
        if (parseInt(req.body.withdraw) <= befBalance) {
          curBalance -= parseInt(req.body.withdraw);
          Balance.deleteOne({ balance: befBalance }, (err) => {
            if (!err) {
              const balance = new Balance({
                balance: curBalance,
              });
              balance.save();
              req.flash("message", "Success");
              setTimeout(() => res.redirect("/balance-box"), 50);
            }
          });
        } else {
          req.flash("message", "Failed");
          setTimeout(() => res.redirect("/balance-box"), 50);
        }
      }
    });
  });
app
  .route("/login")
  .get((req, res) => {
    const message = req.flash("message");
    res.render("login", { message });
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (!err) {
        passport.authenticate("local", {
          failureRedirect: "/login",
          failureFlash: req.flash("message", "Something went wrong!"),
        })(req, res, () => {
          res.redirect("/");
        });
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    const message = req.flash("message");
    res.render("register", { message });
  })
  .post((req, res) => {
    const username = req.body.username;
    let valid = true;
    if (
      username.length != 5 ||
      parseInt(username[0]) + parseInt(username[1]) + parseInt(username[2]) !=
        parseInt(username.substring(3, 5))
    ) {
      valid = false;
    }
    User.findOne({ username: username }, (err, user) => {
      if (user != null) {
        req.flash("message", "User Id already exist!");
        res.redirect("/register");
      } else if (!valid) {
        req.flash("message", "User Id is not valid!");
        res.redirect("/register");
      } else {
        User.register(
          { username: req.body.username },
          req.body.password,
          (err, user) => {
            if (!err) {
              passport.authenticate("local")(req, res, () => {
                res.redirect("/");
              });
            }
          }
        );
      }
    });
  });

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => console.log("Server started on port 3000"));

// https://hidden-anchorage-09762.herokuapp.com/
