

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Users = require('./users/users-model');
// const knexSessionStore = require('connect-session-knex')(session);

const server = express();

const sessionOptions = {
    name: 'project',
    secret: 'What is a secret?',
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        secure: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,

    // store: new knexSessionStore({
        
    // })
}


server.use(session(sessionOptions)); // creates new session if not already there
server.use(helmet());
server.use(express.json());
server.use(cors());


// const sessionOptions = {
//     name: 'project',
//     secret: 'What is a secret?',
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 2,
//         secure: false
//     },
//     httpOnly: true,
//     resave: false,
//     saveUninitialized: false,

//     // store: new knexSessionStore({
        
//     // })
// }

server.get('/', (req, res) => {
    res.send('Initial endpoint!')
});

server.post('/api/register', (req, res) => {
    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 16);

    user.password = hash;

    Users.add(user)
        .then(saveUser => {
            res.status(201).json(saveUser)
        })
        .catch(error => {
            res.send(500).json({error})
        })

});

server.post('/api/login', (req, res) => {
    console.log(req.session)
    const {username, password} = req.body;

    Users.getBy({username})
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)){
                req.session.user = user;
                res.status(200).json({message: `Welcome ${user.username}, have a cookie!`})
            } else {
                res.status(401).json({message: 'invalid credentials!'})
            }
        })
        .catch(error => {
            res.send(500).json({error})
        })
})

const checkCredentials = (req, res, next) => {
    const {username, password} = req.headers;

    if (username && password) {


    Users.getBy({username})
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)){
                next();
            } else {
                res.status(401).json({message: 'invalid credentials!'})
            }
        })
        .catch(error => {
            res.send(500).json({error})
        })
    } else {
        res.status(400).json({message: "No credentials provided"})
    }
}

server.get('/api/users', checkCredentials, (req, res)=> {


    Users.get()
        .then(findUser => {
            res.status(200).json(findUser);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});


const port = process.env.PORT || 6000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
