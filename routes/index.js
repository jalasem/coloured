const routes = require('express').Router();

routes.get('/', (req, res) => {
  Promise.all([getPosts()]).then(data => {
    let posts = data[0];
    console.log(posts);
    res.end("hello home");
  })
});


routes.get('/controls/admin')

module.exports = routes