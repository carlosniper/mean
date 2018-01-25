'use strict'
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user');
var jwt = require('../services/jwt');
var mogoosePaginate = require('mongoose-pagination');

function pruebas(req, res){
  return res.status(200).send({message: 'Controlador de prueba'});
}

function saveUser(req, res) {
  var params = req.body;
  var user = new User();

  if (params.name && params.surname && params.surname &&
    params.nick && params.email && params.password) {

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.nick = params.nick;
    user.image = null;
    user.role = 'ROLE_USER';
    //comprobar usuarios duplicados
    User.find({
      $or: [{
          email: params.email.toLowerCase()
        },
        {
          nick: params.nick.toLowerCase()
        }
      ]
    }).exec((err, users) => {
      if (err) return res.status(500).send({
        message: "Error en la peticion, el usuario ya existe"
      });
      if (users && users.length >= 1) return res.status(200).send({
        message: "Error. El usuario ya existe"
      });
      else {
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;
          user.save((err, userStored) => {
            if (err) return res.status(500).send({
              message: "Error al crear el usuario"
            });
            if (userStored) return res.status(200).send(userStored);
            else {
              return res.status(404).send({
                message: "No se ha registrado el usuario"
              });
            }
          });
        });
      }
    });
  }
}

function login(req, res) {
  var params = req.body;
  User.findOne({email: params.email}, (err, user) =>{
    if(err) return res.status(500).send({message: "Error al realizar login"});
    if(user){
      bcrypt.compare(params.password, user.password, (err,check)=>{

        if(err) return res.status(500).send({message: "Error al realizar login"});
        if(check){
          if(params.gettoken){
              return res.status(200).send({token: jwt.createToken(user)});
          }else{
            user.password = undefined;
            return res.status(200).send(user);
          }
        }
      });
    }else {
       return res.status(404).send({message: "El usuario no se encuentra"});
    }
  });
}

function getUser(req, res){
  var userId = req.params.id;
  /*if(!params.nick){
    return res.status(403).send({message: 'No se ha indicado el campo nick'});
  }*/
  User.findById(userId, (err, user) =>{
    if(err) return res.status(500).send({message: 'Error al recuperar el usuario'});
    if(user) return res.status(200).send(user);
    else{
      return res.status(404).send({message: 'Usuario no existe'});
    }
  });


}

function getUsers(req, res){
  var identity_user_id = req.user.sub;
var page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  var itemsPerPage = 5;
  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
    if(err) return res.status(500).send({message: 'Error en la peticion'});
    if(users) return res.status(200).send({
      users,
      total,
      pages: Math.ceil(total/itemsPerPage)
    });
    else{
      return res.status(404).send({message: 'No hay usuarios disponible'});
    }
  })
}

function updateUser(req, res){
  var idUser = req.params.id;
  var params = req.body;
  delete params.password;
  if(idUser != req.user.sub) return res.status(500).send({message: 'No tienes permiso para modificar este usario'});
  User.findByIdAndUpdate(idUser, params, {new:true}, (err, userUpdate) =>{
    if(err) return res.status(500).send({message: 'Error al actualizar la informacion del usuario'});
    if(userUpdate) res.status(200).send({userUpdate});
    else{
      return res.status(404).send({message: 'No hay usuario disponible'});
    }
  })


}

module.exports = {
  pruebas,
  saveUser,
  getUser,
  getUsers,
  updateUser,
  login
};
