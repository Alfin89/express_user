require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose')

const app = express();
const PORT = process.env.PORT || 3000;

// database connect
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('database connection success'))

// middleware 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: 'my secret key',
        saveUninitialized: true,
        resave: false,
    })
)

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

// setting template engine
app.set('view engine', 'ejs')

// static file
app.use(express.static("uploads"))

// Route prefix
app.use("", require("./routes/routes"))

app.listen(PORT, () => {
    console.log(`server started http://localhost:${PORT}`);
})
