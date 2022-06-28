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

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser("Secret"));
app.use(
  session({
    secret: "Secret",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());

mongoose.connect("mongodb://localhost:27017/storeDB");

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

const Item = mongoose.model("Item", itemSchema);
const Balance = mongoose.model("Balance", balanceSchema);

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
        res.render("store", { items: items });
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
          res.render("store", { items: items });
        });
    } else if (req.body.filter === "old") {
      Item.find({})
        .sort({ time: 1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          res.render("store", { items: items });
        });
    } else if (req.body.filter === "ascName") {
      Item.find({})
        .sort({ name: 1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          res.render("store", { items: items });
        });
    } else if (req.body.filter === "dscName") {
      Item.find({})
        .sort({ name: -1 })
        .exec((err, items) => {
          items.forEach((item) => {
            item.name = _.startCase(item.name);
          });
          res.render("store", { items: items });
        });
    } else {
      const obj = {
        name: _.toLower(req.body.productName),
        desc: req.body.description,
        price: req.body.price,
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
    }
  });
app.post("/delete", (req, res) => {
  Item.deleteOne({ _id: req.body.deleteID }, (err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});
app
  .route("/balance-box")
  .get((req, res) => {
    Balance.find((err, balances) => {
      if (balances.length === 0) {
        const balance = new Balance({
          balance: 0,
        });
        balance.save();
        res.redirect("/balance-box");
      } else {
        const message = req.flash("message");
        res.render("balance", { balance: balances[0].balance, message });
      }
    });
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
            res.redirect("/balance-box");
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
              res.redirect("/balance-box");
            }
          });
        } else {
          req.flash("message", "Failed");
          res.redirect("/balance-box");
        }
      }
    });
  });
app.route("/login").get((req, res)=>res.render("login"));

app.route("/register").get((req, res)=>res.render("register"));

app.listen(process.env.PORT || 3000);
