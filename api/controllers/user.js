'use strict'
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user');

function saveUser(req, res){
  var params = req.body;
  var user = new User();

  if(params.name && params.surname && params.surname
   && params.nick && params.email && params.password){

     user.name = params.name;
     user.surname = params.surname;
     user.email = params.email;
     user.image = null;
     user.role = 'ROLE_USER';
     //comprobar usuarios duplicados
     User.find({$or: [
                        {email: params.email.toLowerCase()},
                        {nick: params.nick.toLowerCase()}
                        ]
                      }).exec((err, users) =>{
                        if(err) return res.status(500).send({message: "Error en la peticion, el usuario ya existe"});
                        if(users && users.length >= 1) return res.status(200).send({message: "Error. El usuario ya existe"});
                        else{
                          bcrypt.hash(params.password, null, null, (err, hash) =>{
                            user.password = hash;
                            user.save((err, userStored) =>{
                              if(err) return res.status(500).send({message:"Error al crear el usuario"});
                              if(userStored) return res.status(200).send(userStored);
                              else {
                                return res.status(404).send({message: "No se ha registrado el usuario"});
                              }
                            });
                      });
                    }
   });
}
}

module.exports = {saveUser};
