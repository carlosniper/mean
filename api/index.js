'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Premise = global.Promise;
mongoose.connect('mongodb://localhost:27017/rrss', {})
        .then(() =>{
          console.log("La conexion se ha realizado correctamente")
          //crear servidor
          app.listen(port, ()=>{
            console.log("Servidor corriendo en http://localhost:3800")
          });
        })
        .catch(err => console.log(err));
