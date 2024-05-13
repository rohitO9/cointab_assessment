const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql");
const app = express();
const port = 4000;
const session = require("express-session")


app.use(bodyparser.urlencoded({ extended: true }));


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
const db = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: 'rohit@123456789',
    database: 'ambers'
});
db.connect(function (err) {
    if (err) throw err;
    console.log(" database Connected!");
});
//register
app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/register.html');
});
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const emailCheckQuery = `SELECT COUNT(*) AS email_count FROM users WHERE email = ?`;
    db.query(emailCheckQuery, [email], (error, results) => {
        if (error) {
            console.error('Error executing email check query: ' + error);
            res.status(500).send('Internal server error');
            return;
        }

        const emailCount = results[0].email_count;

        if (emailCount > 0) {
            res.status(400).send('Email is already registered');
            return;
        }
        else{
        const sql = `INSERT INTO users (username,email, password) VALUES (?,?,?)`;
        db.query(sql, [username, email, password], (err, result) => {
            if (err) {
                throw err;
            }
            res.send('Registration successful! <a href="/">Login</a>');
        });
    }
    })
});
//logout

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});
//login

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/login.html');
})
app.post('/', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            const user = result[0];
            if (!user.active) {
                return res.status(400).json('Your account is blocked for 24 hour.')
            }
            if (user.password === password) {
                db.query('UPDATE users SET login_attempts = 0 WHERE id = ?', [user.id], (updateErr) => {
                    if (updateErr) {
                        throw updateErr;
                    }
                    res.sendFile(__dirname + '/home.html');
                });
            }
            else {
                const loginAttempts = user.login_attempts + 1;
                if (loginAttempts >= 5) {
                    db.query('UPDATE users SET login_attempts = ?, active = FALSE WHERE id = ?', [loginAttempts, user.id], (updateErr) => {
                        if (updateErr) {
                            throw updateErr;
                        }
                        res.send('Your account has been blocked due to multiple incorrect login attempts.');
                    });
                }
                else {
                    db.query('UPDATE users SET login_attempts = ? WHERE id = ?', [loginAttempts, user.id], (updateErr) => {
                        if (updateErr) {
                            throw updateErr;
                        }
                        res.send('Invalid username or password.');
                    });
                }
            }
        }
        else {
            res.send('Invalid username or password.');
        }
    });
});
app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
});