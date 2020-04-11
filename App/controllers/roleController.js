const express = require('express');
const router = express.Router();

const Role = require('../models/role');

router.post('/register', async (req, res) => {
    const {name} = req.body;
    if (await Role.findOne({name}))
        return res.status(400).send({error: 'Permissão já registrada'});
    try {
        const Roles = await Role.create({
            name
        });

        return res.send({Sucesso: "Permissão " + Roles.name + " Cadastrado com Sucesso"
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});


    }

});

router.get('/list', async (req, res) => {

    try {
        const Roles = await Role.find({}, function (err, permission) {
            if (!err){
                return res.send({permission});
            }
        });

    } catch (err) {

        return res.status(400).send({error: 'Busca Falhou'});
    }
});

module.exports = app => app.use('/role', router);
