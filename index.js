const express = require("express"),
  router = express.Router(),
  helmet = require('helmet'),
  hbs = require('hbs'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bcrypt = require('bcrypt'),
  path = require('path'),
  config = require('./config.json'),
  fs = require('fs'),
  cloudinary = require('cloudinary'),
  fileParser = require('connect-multiparty')(),
  mime = require("mime"),
  bodyParser = require('body-parser'),
  admin = require('firebase-admin'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  serviceAccount = require(__dirname + "/credentials/coloured-2a88e-firebase-adminsdk-vt34d-f6c908a0bb.json"),
  app = express();

mongoose.Promise = global.Promise;

cloudinary.config({cloud_name: 'jalasem', api_key: '977684335728887', api_secret: 'DQkLl9L0x843jwLcXXivqDiNWxc'});

mongoose.connect(`mongodb://${config.db_user}:${config.db_pass}@ds133279.mlab.com:33279/coloured`, {
  useMongoClient: true
}, (err, db) => {
  if (err) {
    console.log("Couldn't connect to database");
  } else {
    console.log("Database Connected!");
  }
});

// models
const Admin = require('./models/admin');
Post = require('./models/post'),
Category = require('./models/category'),
Metadata = require('./models/metadata'),
Subscriber = require('./models/subscriber');

const GetPosts = () => {
  return Post
    .find({})
    .exec((err, data) => {
      if (err) {
        console.log(JSON.stringify(err, undefined, 2));
        return err;
      } else {
        return data;
      }
    });
};
const GetPublishedPosts = () => {
  return Post
    .find({published: true})
    .exec((err, data) => {
      if (err) {
        console.log(JSON.stringify(err, undefined, 2));
        return err;
      } else {
        return data;
      }
    });
};
const GetUnpublishedPosts = () => {
  return Post
    .find({published: false})
    .exec((err, data) => {
      if (err) {
        console.log(JSON.stringify(err, undefined, 2));
        return err;
      } else {
        return data;
      }
    });
};
const GetFeaturedPosts = () => {
  return Post
    .find({featured: true})
    .exec((err, data) => {
      if (err) {
        return err;
      } else {
        return data;
      }
    });
};
const GetCategories = cat => {
  return Category
    .find({})
    .select('name')
    .exec((err, cats) => {
      return cats;
    });
};
const GetPostsByCategory = cat => {
  return Post
    .find({category: cat})
    .exec((err, data) => {
      if (err) {
        console.log(JSON.stringify(err, undefined, 2));
        return err;
      } else {
        return data;
      }
    });
};
const GetPublishedPostsByCategory = cat => {
  return Post
    .find({category: cat, published: true})
    .exec((err, data) => {
      if (err) {
        console.log(JSON.stringify(err, undefined, 2));
        return err;
      } else {
        return data;
      }
    });
};
const GetsinglePost = (year, month, slug) => {
  return Post.findOne({slug: slug}, (err, post) => {
    if (err)
      return 0;
    return post;
  });
};
const GetPostWithSlug = (slug) => {
  return Post.findOne({slug: slug}, (err, post) => {
    if(err)
      return 0;
    return post;
  });
}
const GetNoOfPosts = () => {
  return Post.count({}, (err, count) => {
    if (err)
      return 0;
    return count;
  });
};
const GetNoOfPublishedPosts = () => {
  return Post.count({
    published: true
  }, (err, count) => {
    if (err)
      return 0;
    return count;
  });
};
const GetNoOfUnpublishedPosts = () => {
  return Post.count({published: false}, (err, count) => {
    if(err)
      return 0;
    return count;
  });
};
const GetNoOfPostsInCategory = cat => {
  return Post.count({
    category: cat
  }, (err, count) => {
    if (err)
      return 0;
    return count;
  });
};
const GetNoOfPublishedPostsInCategory = cat => {
  return Post.count({
    category: cat,
    published: true
  }, (err, count) => {
    if (err)
      return 0;
    return count;
  });
};

const GetMetadata = () => {
  return Metadata
    .find()
    .exec((err, data) => {
      if (err)
        return 0;
      return data;
    });
};

let logout = (req, res, next) => {
  delete req.session.user
  req
    .session
    .destroy();
  // res.send("logout success!");
  res.redirect('/controls/login');
};

let authorize = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.send("<h1>login</h1>")
  }
};

app.use(helmet());
app.disable('x-powered-by');
// app.use(passport.initialize()) app.use(passport.session())
app.use(cookieParser());
app.use(session({secret: 'iy98hcbh489n38984y4h498', resave: true, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.set('serverPort', (process.env.PORT || 3030));
process.env.PWD = process.cwd();
app.use(express.static(path.join(process.env.PWD, 'public')));

hbs.registerPartials(path.join(process.env.PWD, 'views/partials'));
app.set('views', path.join(process.env.PWD, 'views'));
app.set('view engine', 'hbs');

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('if_eq', function (a, b, opts) {
  if (a == b) // Or === depending on your needs
    return opts.fn(this);
  else
    return opts.inverse(this);
  }
);

hbs.registerHelper('getPostTime', (timeT) => {
  return new Date(timeT).toDateString();
});

router.get('/', (req, res) => {
  Promise.all([GetPublishedPosts(), GetCategories(), GetMetadata(), GetFeaturedPosts()]).then(data => {
    let posts = data[0];
    let categories = data[1];
    let metadata = data[2][0];
    let featured = data[3];
    let empty = true;
    if(posts.length > 0)
      empty = false;
    res.render('index.hbs', {
      posts: posts.reverse(),
      categories,
      metadata,
      featured,
      home: true,
      postsGroupTitle: "LATEST POSTS",
      thisPage: {
        title: "Home",
        home: true
      },
      empty
    });
  });
});

router.get('/category/:cat', (req, res) => {
  var cat = req.params.cat;
  if(cat == "feminists_rising"){
    cat = "feminists rising"
  }
  Promise.all([
    GetPublishedPostsByCategory(cat),
    GetCategories(), GetMetadata()
  ]).then(data => {
    let posts = data[0];
    let categories = data[1];
    let metadata = data[2][0];
    let empty = true;
    if(posts.length > 0)
      empty = false;
    res.render('index', {
      posts: posts.reverse(),
      categories, metadata,
      thisPage: {
        title: cat.toUpperCase(),
        category_page: true
      },
      empty
    });
  }).catch(err => {
    res.send({
      message: 'error fetching category' + req.params.cat,
      code: 'NOT_OK'
    });
  })
})

router.get('/p/:year/:month/:slug', (req, res) => {
  let year = req.params.year;
  let month = req.params.month;
  let slug = req.params.slug;

  Promise.all([GetsinglePost(year,month,slug), GetMetadata(), GetCategories()]).then(data => {
    let post = data[0];
    let metadata = data[1][0];
    let categories = data[2];
    let title = post.title;

    res.render("singlePost", {
      categories, metadata, post,
      thisPage: {
        title,
        singlepost: true
      }
    })
  })
});

router.get('/about', (req, res) => {
  Promise.all([GetMetadata()]).then(data => {
    let metadata = data[0][0];

    res.render('about', {
      metadata,
      about: metadata.about
    })
  });
})

router.post('/api/login', (req, res) => {
  // login
  let credential = req
    .body
    .loginCred
    .toLowerCase();
  let password = req.body.password
  if (credential.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null) {
    Admin.findOne({
      username: credential
    }, (err, data) => {
      if (err) {
        res.sendStatus(401);
      } else if (data && data !== null) {
        let pass = data.password;
        bcrypt
          .compare(password, pass)
          .then(result => {
            if (result) {
              let user = {
                authorized: result,
                id: data._id,
                username: data.username,
                name: data.fullname
              }
              req.session.user = user;
              req.session.user.expires = new Date(Date.now() + (3 * 24 * 3600 * 1000));
              Admin.findOneAndUpdate(data._id, {
                last_login: new Date().getTime()
              });
              res.send('login success!');
            } else {
              res.sendStatus(401);
            }
          });
      } else {
        res.sendStatus(401);
      }
    });
  } else {
    Admin.findOne({
      email: credential
    }, (err, data) => {
      if (err) {
        res.sendStatus(401);
      } else if (data && data !== null) {
        let pass = data.password;
        bcrypt
          .compare(password, pass)
          .then(result => {
            if (result) {
              let user = {
                result,
                id: data._id,
                name: data.fullname
              }
              req.session.user = user;
              req.session.user.expires = new Date(Date.now() + (3 * 24 * 3600 * 1000));
              Admin.findOneAndUpdate(data._id, {
                last_login: new Date().getTime()
              });
              res.send('login success!');
            } else {
              res.sendStatus(401);
            }
          })
      } else {
        res.sendStatus(401);
      }
    });
  }
});

router.get('/controls/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/controls/admin')
  } else {
    res.render("login_Admin.hbs")
  }
});

// authorization middleware
router.use((req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/controls/login')
  }
});

router.post('/api/createAdmin', (req, res, next) => {
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let username = req.body.username;
  let email = req.body.email;

  let salt = bcrypt.genSaltSync(5);
  let password = bcrypt.hashSync(req.body.password, salt);

  let newAdmin = new Admin({
    username,
    firstname,
    lastname,
    email,
    password,
    salt
  });

  newAdmin
    .save()
    .then(() => {
      res.send({message: `Admin account created successfully`, code: 'OK'});
    })
    .catch(err => {
      res.send({message: 'error creating admin', code: 'NOT_OK'});
    });
});

router.put('/api/changePass', (req, res) => {
  let username = req.session.user.username;
  let newPass = req.body.newpass;
  let salt = bcrypt.genSaltSync(5);
  let password = bcrypt.hashSync(newPass, salt);

  Admin.findOneAndUpdate({username: username}, {password: password, salt: salt}, err => {
    if(!err) {
      res.send({message: "sucess", code: 'OK'});
    } else {
      res.send({message: "error", code: 'NOT_OK'});
    }
  })
});

router.put('/api/changeAdminDetails', (req, res) => {
  let username = req.session.user.username;
  Admin.findOne({username: username}, (err, details) => {
    //TODO: set changes variable and save
  })
})

router.post('/api/upload/image', fileParser, (req, res) => {
  var imageFile = req.files.file;
  cloudinary
    .uploader
    .upload(imageFile.path, (result) => {
      if (result.url) {
        res.send({result});
      } else {
        res.send({message: "Error uploading to cloudinary", code: 'NOT_OK'});
        console.log('Error uploading to cloudinary: ', result);
      }
    })
});

router.post('/api/createPost', (req, res) => {
  let title = req.body.title,
    author = req.session.user.name || 'robotester',
    description = req.body.description,
    body = req.body.body,
    category = req.body.category;

  thisTime = new Date(),
  createdOn = thisTime.getTime();
  month = config.monthNames[thisTime.getMonth()],
  year = thisTime.getFullYear(),
  published = req.body.published,
  media = req.body.media

  let newPost = new Post({
    author,
    title,
    description,
    body,
    category,
    month,
    media,
    year,
    published
  });

  newPost
    .save()
    .then(() => {
      // TODO: add the postID to post category
      res.send({message: 'Post created successfully', code: 'OK'});
    })
    .catch(err => {
      console.log(JSON.stringify(err, undefined, 2));
      res.send({message: 'error creating post', code: 'NOT_OK'});
    });
});

router.post('/api/editPost/:slug', (req, res) => {
  let slug = req.params.slug;
    title = req.body.title,
    author = req.session.user.name || 'robotester',
    description = req.body.description,
    body = req.body.body,
    category = req.body.category;
    thisTime = new Date(),
    createdOn = thisTime.getTime();
    month = config.monthNames[thisTime.getMonth()],
    year = thisTime.getFullYear(),
    published = req.body.published,
    media = req.body.media

  let postUpdate = {}
  if(media != null){
    postUpdate = {
      author,
      title,
      description,
      body,
      category,
      month,
      media,
      year,
      published
    }
  } else {
    postUpdate = {
      author,
      title,
      description,
      body,
      category,
      month,
      year,
      published
    }
  }


  Post.findOneAndUpdate({slug: slug}, postUpdate, (err) => {
    if(!err){
      res.send({message: 'Post modified successfully', code: 'OK'});
    } else {
      res.send({message: 'error creating post', code: 'NOT_OK'});
    }
  })
});

router.post('/api/featurePost', (req, res) => {
  let slug =  req.body.slug;
  Post.count({featured: true}, (err, count) => {
    if(!err){
      if(count <= 3){
        Post.findOneAndUpdate({slug: slug}, {featured: true}, err => {
          if(!err)
            res.send({message: 'post featured successfully', code: 'OK'});
          if(err){
            res.send({message: 'error featurung post. Try again later', code: 'NOT_OK'});
            throw err;
          }
        })
      } else {
        res.send({message: 'Maximum no. of featured post is three(3)', code: 'NOT_OK'});
      }
    }
  });
});
router.post('/api/unfeaturePost', (req, res) => {
  let slug =  req.body.slug;

  Post.findOneAndUpdate({slug: slug}, {featured: false}, err => {
    if(!err)
      res.send({message: 'post unfeatured successfully', code: 'OK'});
    if(err){
      res.send({message: 'error featurung post. Try again later', code: 'NOT_OK'});
      throw err;
    }
  })

});

router.delete('/api/deletePost', (req, res) => {
  let slug = req.body.postID;
  Post.deleteOne({slug: slug}, err => {
    if(!err){
      res.send({message: 'post deleted successfully', code: 'OK'});
    } else {
      res.send({message: 'Could not delete post', code: 'NOT_OK'});
    }
  });
});

router.post('/api/createCategory', (req, res) => {
  let name = req.body.name,
    thisTime = new Date(),
    month = config.monthNames[thisTime.getMonth()],
    year = thisTime.getFullYear();

  let newCat = new Category({name, month, year});

  newCat
    .save()
    .then(() => {
      res.send({message: "Category created successfully", code: 'OK'});
    })
    .catch(err => {
      console.log("error creating post:" + JSON.stringify(err, undefined, 2));
      res.send({message: 'error creating category', code: 'NOT_OK'});
    });
});
router.put('/api/editCategory', (req, res) => {
  let name = req.body.newName;
  let oldName = req.body.name;

  Category.findOneAndUpdate({name: oldName}, {name: name}, (errr) => {
    if(!errr) {
      Post.updateMany({category: oldName}, {category: name}, err => {
        if(!err){
            res.send({message: "success", code: 'OK'});
          } else {
            res.send({message: "error", code: "NOT_OK"});
            console.log(JSON.stringify(err, undefined, 2));
          }
      })
    } else {
      res.send({message: "error", code: "NOT_OK"});
      console.log(JSON.stringify(errr, undefined, 2));
    }
  });
});
router.delete('/api/deleteCategory', (req, res) => {
  let name = req.body.catname;
  Category.findOneAndRemove({name: name}, (errr) => {
    if(!errr){
      Post.updateMany({category: name}, {category: 'general'}, err => {
        if(!err){
          res.send({message: "success", code: 'OK'});
        } else {
          res.send({message: "error", code: "NOT_OK"})
        }
      });
    } else {
      res.send({message: "error", code: "NOT_OK"})
    }
  });
});

router.patch('/api/metadata', (req, res) => {
  let aboutColoured = req.body.aboutColoured;
  let aboutAuthor = req.body.aboutAuthor;
  let twUrl = req.body.twUrl;
  let fbUrl = req.body.fbUrl;
  let igUrl = req.body.igUrl;

  let update = {
    about: aboutColoured,
    author: {
      about: aboutAuthor
    },
    social: {
      facebook: fbUrl,
      twitter: twUrl,
      instagram: igUrl
    }
  }

  Metadata.findByIdAndUpdate("59746ce7443f862d984cbb56", update, (err) => {
    if(!err){
      res.send({message: "Update successfull", code: 'OK'});
    } else {
      res.send({message: "Update error", code: 'OK'})
    }
  });
});

app.get('/controls/logout', logout);

// admin pages

router.get('/controls/admin', (req, res) => {
  Promise
    .all([GetPosts(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let posts = result[0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      let empty = true;
      if(posts.length > 0)
        empty = false;
      return res.render("admin_posts", {
        adminfname, adminlname, posts,
        // nop, nopp, noup,
        thisPage: {
          title: "Admin Home",
          admin_home: true
        }, empty, nop, nopp, noup
      });
    });
});

router.get('/controls/posts/published', (req, res) => {
  Promise
    .all([GetPublishedPosts(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let posts = result[0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      let empty = true;
      if(posts.length > 0)
        empty = false;
      return res.render("admin_published_posts", {
        adminfname, adminlname, posts,
        // nop, nopp, noup,
        thisPage: {
          title: "Published Posts",
          published: true
        }, empty, nop, nopp, noup
      });
    });
});

router.get('/controls/posts/drafts', (req, res) => {
  Promise
    .all([GetUnpublishedPosts(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let posts = result[0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      let empty = true;
      if(posts.length > 0)
        empty = false;
      return res.render("admin_draft_posts", {
        adminfname, adminlname, posts,
        thisPage: {
          title: "Draft Posts",
          draft: true
        }, empty, nop, nopp, noup
      });
    });
});

router.get('/controls/posts/featured', (req, res) => {
  Promise
    .all([GetFeaturedPosts(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let posts = result[0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      let empty = true;
      if(posts.length > 0)
        empty = false;
      return res.render("admin_featured", {
        adminfname, adminlname, posts,
        // nop, nopp, noup,
        thisPage: {
          title: "featured posts",
          featured: true
        }, empty, nop, nopp, noup
      });
    });
});

router.get('/controls/categories', (req, res) => {
  Promise
    .all([GetCategories(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let categories = result[0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      let empty = true;
      if(categories.length > 0)
        empty = false;
      return res.render("admin_categories", {
        adminfname, adminlname, categories,
        // nop, nopp, noup,
        thisPage: {
          title: "Categories",
          categories: true
        }, empty, nop, nopp, noup
      });
    });
});

router.get('/controls/siteInfo', (req, res) => {
  Promise
    .all([GetMetadata(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()])
    .then((result) => {
      let metadata = result[0][0];
      let adminName = req.session.user.name;
      let adminfname = adminName.split(" ")[0];
      let adminlname = adminName.split(" ")[1];

      let nop = result[1];
      let nopp = result[2];
      let noup = result[3];

      console.log()

      return res.render("site_info", {
        adminfname, adminlname, metadata,
        // nop, nopp, noup,
        thisPage: {
          title: "Categories",
          categories: true
        }, nop, nopp, noup
      });
    });
});

router.get('/controls/admin/createPost', (req, res) => {
  Promise.all([GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts(), GetCategories()]).then(result => {
    let nop = result[0];
    let nopp = result[1];
    let noup = result[2];
    let cats = result[3]

    let adminName = req.session.user.name;
    let adminfname = adminName.split(" ")[0];
    let adminlname = adminName.split(" ")[1];

    res.render('admin_new_post.hbs', {
      adminfname,
      adminlname,
      cats,
      nop,
      nopp,
      noup
    })
  });
});

router.get('/controls/posts/edit/:slug', (req, res) => {
  Promise.all([GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts(), GetCategories(), GetPostWithSlug(req.params.slug)]).then(result => {
    let nop = result[0];
    let nopp = result[1];
    let noup = result[2];
    let cats = result[3];
    let thisPostData = result[4];

    let adminName = req.session.user.name;
    let adminfname = adminName.split(" ")[0];
    let adminlname = adminName.split(" ")[1];

    res.render('admin_edit_post.hbs', {
      adminfname,
      adminlname,
      thisPostData,
      cats,
      nop,
      nopp,
      noup
    })
  })
});

router.get('/controls/admin/')

router.get('/controls/profile', (req, res) => {
  Promise.all([GetMetadata(), GetNoOfPosts(), GetNoOfPublishedPosts(), GetNoOfUnpublishedPosts()]).then(result => {
    let metadata = result[0]
    let nop = result[1];
    let nopp = result[2];
    let noup = result[3];

    let adminName = req.session.user.name;
    let adminfname = adminName.split(" ")[0];
    let adminlname = adminName.split(" ")[1];

    return res.render('profile', {
      adminfname,
      adminlname,
      metadata,
      nop,
      nopp,
      noup,
      thisPage: {
        title: `Profile - ${adminfname} ${adminlname}`,
        Profile: true
      }
    })
  })
})


app.use('/', router);

const port = process.env.PORT || 5050;
app.listen(port, () => {

  console.log(`server running on port ${port}`);
});

// Category.findOne({ 'name': 'law' }).select('_id').exec((err, data) => {
// if(err)         console.log(JSON.stringify(err, undefined, 2));
// console.log(data._id);   });