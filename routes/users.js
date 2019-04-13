var express = require('express');
var router = express.Router();
const mysql = require('mysql2');
var models = require('../models');
var passport = require('../services/passport');

/* GET users listing. */
router.get("/users/:id", function(req, res, next) {
  let userId = parseInt(req.params.id);
  models.users
    .find({ where: { UserId: userId } })
    .then(user => res.render("specificUser", { user: user }));
});

router.get("/", function(req, res, next) {
  if (req.user && req.user.Admin) {
    models.users
      .findAll({})
      .then(users => res.render("users", { users: users }));
  } else {
    res.redirect("unauthorized");
  }
});

router.get("/unauthorized", function(req, res, next) {
  res.render("unauthorized");
});

// router.get('/', function(req, res, next) {
//   if (req.user && req.user.Admin)
//   {
//   models.users
//   .findAll({ 
//     // attributes: ['UserId', 'FirstName', 'LastName', 'Username', 'Email']
//   })
//   .then(usersFound =>{
//     res.render('Allusers',{
//       users: usersFound
//     });
//   });
// } else{
//   res.redirect('unauthorized');
// };
// });


router.get('/signup', function(req, res, next){
  res.render('signup');
});
router.post('/signup', function(req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.username
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: req.body.password
      }
    })
    .spread(function(result, created) {
      if (created) {
        res.redirect('login');
      } else {
        res.send('This user already exists');
      }
    });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login' }),
  function (req, res, next) { res.redirect('profile') }); 

router.get('/profile', function (req, res, next) {
  if (req.user) {
    models.users
      .findById(parseInt(req.user.UserId))
      .then(user => {
        if (user) {
          res.render('profile', {
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Username: user.Username
          });
        } else {
          res.send('User not found');
        }
      });
  } else {
    res.redirect('/users/login');
  }
});

router.delete('/:id',function( req, res, next){
  if (req.user && req.user.Admin) {
    let userId = parseInt(req.params.id);
    models.users
      .update({ Deleted: true }, { where: { UserId: userId } })
      .then(result => res.redirect("/users"))
      .catch(error => {
        res.status(400);
        res.send("error deleting user");
      });
  } else {
    res.redirect("unauthorized");
  }
});

//   let userId = parseInt(req.params.id);

//   models.users
//   .destroy({ where:{UserId: userId }})
//   .then(result =>
//     res.redirect('/users'))
//     .catch(err => {
//       res.status(400);
//       res.send("couldn't delete anything boss, you gotta fix it");
//     })
// });

module.exports = router;
