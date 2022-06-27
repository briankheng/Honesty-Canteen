const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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

const Item = mongoose.model("Item", itemSchema);

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
    Item.find((err, items) => {
      res.render("store", { items: items });
    });
  })
  .post(upload.single("image"), (req, res, next) => {
    const obj = {
      name: req.body.productName,
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
  });
app.post("/delete", (req, res)=>{
  Item.deleteOne({_id: req.body.deleteID}, (err)=>{
    if(!err){
      res.redirect("/");
    }
  })
})
app.listen(process.env.PORT || 3000);
