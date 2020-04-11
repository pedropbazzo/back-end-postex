const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();
let nodemailer = require('nodemailer');

const Cnpj = require('../models/clienteCNPJ');
const Carteira = require('../models/carteira');

const generateToken = (params = {}) => jwt.sign(params, authconfig.secret, {expiresIn: 86400});

router.post('/register', async (req, res) => {
    const {name,
        produto,
        cnpj,
        ddd,
        telefone,
        email,
        cep,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        bairro,
    password} = req.body;
    if (await Cnpj.findOne({cnpj}))
        return res.status(400).send({error: 'CNPJ já registrado'});

    const validaremail = await emailRegexp.test(email);
    if (validaremail == false)
        return res.status(400).send({error: 'Email cadastrado não existe!'});

    if (cep.length !==9)
        return res.status(400).send({error: 'CEP não existe!'});
    if (cep == "00000-000")
        return res.status(400).send({error: 'CEP não existe!'});

    if (cnpj.length !==18)
        return res.status(400).send({error: 'CNPJ não existe!'});
    if (cnpj == "00.000.000/0000-00")
        return res.status(400).send({error: 'CNPJ não existe!'});

    try {
        const cupon = crypto.randomBytes(20).toString('hex')
        const pass = crypto.randomBytes(3).toString('hex').toLowerCase().slice(0, 5);
        const cliente = await Cnpj.create({
            name,
            produto,
            cnpj,
            ddd,
            telefone,
            email,
            cep,
            estado,
            cidade,
            endereco,
            numero,
            complemento,
            bairro,
            password: pass,
            saldo:"0,00",
            cupon_desconto: cupon,
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
            text: 'Bem vindo a Postex, sua senha inicial é: ' + pass,
            subject: 'Postex - Bem Vindo', // Subject line
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                return res.status(400).send({error: 'Cannot send forgot password mail / ' + err});
            else
                return res.status(200).send({info});
        });
        return res.send({
            cliente,
            token: generateToken({id: cliente._id})
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});


    }

});

router.post('/login', async (req, res) => {
    const {cnpj, password} = req.body;

    try {
        const cliente = await Cnpj.findOne({cnpj}).select('+password');

        if (!cliente)
            return res.status(400).send({error: 'Usuario não cadastrado'});
        if (!await bcrypt.compareSync(password, cliente.password))
            return res.status(400).send({error: 'Senha Incorreta'});

        cliente.password = undefined;
        res.send({
            cliente,
            token: generateToken({id: cliente._id})
        });

    } catch (err) {

        return res.status(400).send({error: 'Login Falhou'});
    }
});

router.post('/change_password', async (req, res) => {
    const {old_password, password, cnpj} = req.body;
    try {
        let cliente = await Cnpj.findOne({cnpj}).select('+password');
        if (!cliente) {
            return res.status(400).send({error: 'Usuario não cadastrado'});
        }
        if (!await bcrypt.compareSync(old_password, cliente.password)) {
            return res.status(400).send({error: 'Senha antiga não esta correta.'});
        }


        cliente.password = password;
        await cliente.save();
        return res.send('Senha alterada com sucesso.');
    } catch (err) {
        return res.status(400).send({error: 'Erro ao alterar senha ' + err});
    }

});

router.post('/update', async (req, res) => {
    const {name,
        produto,
        cnpj,
        ddd,
        telefone,
        email,
        cep,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        bairro} = req.body;

    try {
        await Cnpj.updateOne({'cnpj': cnpj}, {name: name});
        await Cnpj.updateOne({'cnpj': cnpj}, {produto: produto});
        await Cnpj.updateOne({'cnpj': cnpj}, {ddd: ddd});
        await Cnpj.updateOne({'cnpj': cnpj}, {telefone: telefone});
        await Cnpj.updateOne({'cnpj': cnpj}, {email: email});
        await Cnpj.updateOne({'cnpj': cnpj}, {cep: cep});
        await Cnpj.updateOne({'cnpj': cnpj}, {estado: estado});
        await Cnpj.updateOne({'cnpj': cnpj}, {cidade: cidade});
        await Cnpj.updateOne({'cnpj': cnpj}, {endereco: endereco});
        await Cnpj.updateOne({'cnpj': cnpj}, {numero: numero});
        await Cnpj.updateOne({'cnpj': cnpj}, {complemento: complemento});
        await Cnpj.updateOne({'cnpj': cnpj}, {bairro: bairro});
        const cliente = await Cnpj.findOne({cnpj: cnpj});
        res.send({
            cliente,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.post('/forgot_password', async (req, res) => {
    const {cnpj} = req.body;
    try {
        const cliente = await Cnpj.findOne({cnpj});
        if (!cliente)
            return res.status(400).send({error: 'Usuario não cadastrado'});

        const token = crypto.randomBytes(3).toString('hex').toLowerCase().slice(0, 5);

        cliente.password = token;
        await cliente.save();

        let transporter = nodemailer.createTransport({
            host: 'smtp.kinghost.net',
            port: 587,
            secure: false,
            auth: {
                user: 'sac@postexexpress.com.br',
                pass: '4AJK9pH2'
            }
        });

        const mailOptions = {
            to: cliente.email,
            cc: 'allan.monteiro@sinergiasolucoes.com',
            from: 'sac@postexexpress.com.br',
            subject: 'Postex - Resetar Senha',
            text: 'Conforme solicitado, geramos uma nova senha temporária para você: ' + token,
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                return res.status(400).send({error: 'Cannot send forgot password mail / ' + err});
            else
                return res.status(200).send({info});
        });

    } catch (err) {
        res.status(400).send({error: 'Error on forgot password,please try again / ' + err})
    }
});

router.post('/saldo', async (req, res) => {
    const {saldo, cnpj} = req.body;

    try {
        const saldocliente = await Cnpj.updateOne({'cnpj': cnpj}, {saldo: saldo});
        const cliente = await Cnpj.findOne({cnpj: cnpj});
        res.send({
            cliente,
            saldocliente,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.post('/saldo', async (req, res) => {
    const {saldo, cnpj} = req.body;

    try {
        const atual = await Cnpj.findOne({cnpj: cnpj});
        const total = Number(saldo) + Number(atual.saldo);
        let dataagora = new Date;
        let dia = dataagora.getDate();
        if ( dia < 10){
            dia = "0" + dia
        }
        let mes = dataagora.getMonth() + 1;
        if ( mes < 10){
            mes = "0" + mes
        }
        let ano = dataagora.getFullYear();
        const datacomposto = dia +"/"+mes+"/"+ano;
        await Carteira.create({
            user: atual._id,
            data: datacomposto,
            valor: saldo,
        });

        await Cnpj.updateOne({'cnpj': cnpj}, {saldo: total});
        const cliente = await Cnpj.findOne({cnpj: cnpj});
        res.send({
            cliente,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.get('/busca', async (req, res) => {
    const { _id } = req.query;

    try {
        await Carteira.find({user: _id}, function (err, lista) {
            if (!err){
                return res.send({lista});
            }
        });

    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'busca Falhou'});
    }
});


module.exports = app => app.use('/cnpj', router);
