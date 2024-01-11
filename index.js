const { fakerDE: faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv").config();
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	database: "tempDatabase",
	password: process.env.SQL_PASS,
});
///C/Program\ Files/MySQL/MySQL\ Server\ 8.0/bin/mysql -u root -p

// Count of users
let count;
try {
	let q = `SELECT count(*) FROM user`;
	connection.query(q, (err, res) => {
		count = res[0]["count(*)"];
	});
} catch (e) {
	console.log(e);
}

app.get("/", (req, res) => {
	res.render("home.ejs", { count });
});

app.get("/users", (req, res) => {
	let q = `SELECT * FROM user`;
	try {
		connection.query(q, (err, users) => {
			if (err) throw err;
			res.render("users.ejs", { users, count });
		});
	} catch (err) {
		console.log(err);
		res.send("Some Error in DB");
	}
});

app.get("/users/:id/edit", (req, res) => {
	let { id } = req.params;
	let q = `SELECT * FROM user WHERE id='${id}'`;

	try {
		connection.query(q, (err, result) => {
			if (err) throw err;
			let user = result[0];
			res.render("edit.ejs", { user });
		});
	} catch (err) {
		console.log(err);
		res.send("Some Error in DB");
	}
});

app.patch("/users/:id", (req, res) => {
	let { id } = req.params;
	let { password: formPass, username: newUsername } = req.body;
	let q = `SELECT * FROM user WHERE id='${id}'`;

	try {
		connection.query(q, (err, result) => {
			if (err) throw err;
			let user = result[0];
			if (formPass != user.password) {
				res.send("WRONG PASSWORD");
			} else {
				let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
				connection.query(q2, (err, result) => {
					if (err) throw err;
					res.redirect("/users");
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.send("Some Error in DB");
	}
});

app.get("/users/new", (req, res) => {
	res.render("new.ejs");
});

app.post("/users", (req, res) => {
	let userId = uuidv4();
	let { username, email, password } = req.body;
	let q3 = `INSERT INTO user VALUES ('${userId}', '${username}', '${email}', '${password}')`;

	connection.query(q3, (err, result) => {
		if (err) {
			console.error(err);
			return res.send("Error in DB");
		}

		res.redirect("/users");
	});
});

app.get("/users/:id/delete", (req, res) => {
	let { id } = req.params;
	let q4 = `SELECT * FROM user WHERE id='${id}'`;

	try {
		connection.query(q4, (err, result) => {
			if (err) throw err;
			let user = result[0];
			console.log(user);
			res.render("delete.ejs", { user });
		});
	} catch (err) {
		console.log(err);
		res.send("Some Error in DB");
	}
});

app.delete("/users/:id", (req, res) => {
	let { id } = req.params;
	let { password: formPass } = req.body;
	let q = `SELECT * FROM user WHERE id='${id}'`;

	try {
		connection.query(q, (err, result) => {
			if (err) throw err;
			let user = result[0];
			if (formPass != user.password) {
				res.send("WRONG PASSWORD");
			} else {
				let q5 = `DELETE FROM user WHERE id='${id}'`;
				connection.query(q5, (err, result) => {
					if (err) throw err;
					res.redirect("/users");
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.send("Some Error in DB");
	}
});

app.listen(8080, () => {
	console.log("Server is listening to port 8080");
});
