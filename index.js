

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const Users = require('./users/users-model');

const server = express();

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
            res.status(201).json(saveUser)
        })
        .catch(error => {
            res.send(500).json({error})
        })

});

server.post('/api/login', (req, res) => {
    const {username, password} = req.body;

    Users.getBy({username})
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)){
                res.status(200).json(user)
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
