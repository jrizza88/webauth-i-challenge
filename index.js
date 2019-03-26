

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

server.get('/api/users', (req, res)=> {
    Users.get()
        .then(findUser => {
            res.status(200).json(findUser);
        })
        .catch(error => {
            res.status(500).json({message: 'Database issue'});
        })
});


const port = process.env.PORT || 6000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
