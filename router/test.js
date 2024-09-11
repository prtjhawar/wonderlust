const express = require('express');
const routre =  express.Router();


routre.get('/',(req,res)=>{
    res.send("hello")

});

routre.get('/sampling',(req,res)=>{
    res.send("hiiiiiiii........");

});














module.exports = routre;