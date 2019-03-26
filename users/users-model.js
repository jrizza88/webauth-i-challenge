
const db = require('../database/dbConfig');

module.exports = {
    get,
    add
};


function get() {
    return db('users').select('id', 'username', 'password')
}

async function add(user) {
    const [id] = await db('users').insert(user);
  
    return findById(id);
  }