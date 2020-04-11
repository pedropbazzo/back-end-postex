const express = require('express');
const router = express.Router();

const Postagem = require('../models/postagem');

router.post('/register', async (req, res) => {
    const {titulo,conteudo} = req.body;

    try {
        const mensagem = await Postagem.create({
            titulo,
            conteudo
        });

        return res.send({Sucesso: "Mensagem " + mensagem.titulo + " Cadastrado com Sucesso"
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
        await Postagem.find({}, function (err, postagens) {
            if (!err){
                return res.send({postagens});
            }
        });
    } catch (err) {
        return res.status(400).send({error: 'Busca Falhou'});
    }
});

router.delete('/', async (req, res) => {
    const {_id} = req.query;

    try {
        const robo = await Postagem.findOne({_id});
        robo.remove();

        return res.send({Sucesso: "Sucesso ao deletar"});
    } catch (err) {
        console.log(err);

        return res.status(400).send({ error: 'Falha ao Deletar' })
    }

});

module.exports = app => app.use('/postagem', router);
