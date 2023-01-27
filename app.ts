// import express from "express";
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const express = require("express");
const app = express();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected...");
});

const SECRET_KEY = "mysecretkey";

//create account
app.use(express.json());

app.post("/create", (req, res) => {
  const { email, username, password } = req.body;

  // check if email address already exists
  const emailCheck = `SELECT * FROM users WHERE email = '${email}'`;
  db.query(emailCheck, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      return res.status(401).json({
        message: "Email address already in use",
      });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      const query = `INSERT INTO users (email, username, password) VALUES ('${email}', '${username}', '${hash}')`;
      db.query(query, (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: "Account created successfully" });
      });
    });
  });
});

//fund
app.post("/fund", (req, res) => {
  const { email, amount } = req.body;
  const query = `UPDATE users SET balance = balance + ${amount} WHERE email = '${email}'`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: "Account funded successfully" });
  });
});

//transfer
app.post("/transfer", (req, res) => {
  const { senderEmail, recipientEmail, amount } = req.body;
  const query = `UPDATE users SET balance = balance - ${amount} WHERE email = '${senderEmail}'`;
  db.query(query, (err, result) => {
    if (err) throw err;
    const query2 = `UPDATE users SET balance = balance + ${amount} WHERE email = '${recipientEmail}'`;
    db.query(query2, (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: "Funds transferred successfully" });
    });
  });
});

//withdraw
app.post("/withdraw", (req, res) => {
  const { email, amount } = req.body;
  const query = `UPDATE users SET balance = balance - ${amount} WHERE email = '${email}'`;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: "Funds withdrawn successfully" });
  });
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  db.query(query, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      const user = result[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) throw err;
        if (match) {
          const payload = { email: user.email, username: user.username };
          const token = jwt.sign(payload, SECRET_KEY);
          res.status(200).json({ message: "Logged in successfully", token });
        } else {
          res.status(401).json({ message: "Incorrect email or password" });
        }
      });
    } else {
      res.status(401).json({ message: "Incorrect email or password" });
    }
  });
});

//protected
app.use((req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];
  console.log(token);

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Invalid token", err });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
});

app.get("/protected", (req, res) => {
  res.status(200).json({ message: "Protected route accessed" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
module.exports = app;
