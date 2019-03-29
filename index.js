

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Users = require('./users/users-model');
const knexSessionStore = require('connect-session-knex')(session);

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

    // stored via ram/memory
    // store is a class, reason why new is used
    store: new knexSessionStore({
        knex: require('./database/dbConfig'),
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 60
    })
}


server.use(session(sessionOptions)); // creates new session if not already there
server.use(helmet());
server.use(express.json());
server.use(cors());


server.get('/', (req, res) => {
    res.send('Initial endpoint!')
});

server.post('/api/register', (req, res) => {
    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 16);

    user.password = hash;

    Users.add(user)
        .then(saveUser => {
            req.session.user = user;
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
    if (req.session && req.session.user){
        next()
    } else {
        res.status(401).json({message: 'You shall not pass!'})
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

server.get('/api/logout', (req, res) => {
    console.log('log out', req.session)
    if (req.session){
        req.session.destroy(err => {
            if (err) {
                res.send('error logging out');
            } else {
                res.send(`Goodbye! `)
            }
        })
    } else {
        res.end()
    }
}); 


const port = process.env.PORT || 6000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
