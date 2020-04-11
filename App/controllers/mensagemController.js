const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();
let nodemailer = require('nodemailer');
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const CNPJ = require('../models/SejaFranqueadoCNPJ');
const CPF = require('../models/SejaFranqueadoCPF')
const Mensagem = require('../models/mensagemsac');

router.post('/register', async (req, res) => {
    const {nome,
        email,
        telefone,
        assunto,
        conteudo,
        } = req.body;

    const validaremail = await emailRegexp.test(email);

    if (validaremail == false)
        return res.status(400).send({error: 'Email cadastrado não existe!'});

    try {
        const mensagem = await Mensagem.create({
            nome,
            email,
            telefone,
            assunto,
            conteudo,
        });
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'allan.monteiro@sinergiasolucoes.com',
                pass: 'Elefante123'
            }
        });

        const mailOptions = {
            to: email,
            cc: 'allan.monteiro@sinergiasolucoes.com',
            from: 'suporte@postex.com',
            text: 'Obrigado pela sua mensagem, em breve retornaremos o contato!',
            subject: 'Postex - SAC', // Subject line
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                return res.status(400).send({error: 'Cannot send forgot password mail / ' + err});
            else
                return res.status(200).send({info});
        });
        return res.send({
            mensagem,
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(400).send({error: 'Registro Falhou'});


    }

});

router.post('/buscar', async (req, res) => {
    const {latitude, longitude} = req.body;
    try {

        const franquiaCNPJ = await CNPJ.find({
                loc : {
                    $near: [latitude,longitude], $maxDistance: 10
                }
        })

        return res.send({
            franquiaCNPJ,
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});
    }
});

module.exports = app => app.use('/sac', router);
