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

const Cpf = require('../models/SejaFranqueadoCPF');

const generateToken = (params = {}) => jwt.sign(params, authconfig.secret, {expiresIn: 86400});

router.post('/register', async (req, res) => {
    const {name,
        nascimento,
        cpf,
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
        latitude,
        longitude} = req.body;

    if (await Cpf.findOne({cpf}))
        return res.status(400).send({error: 'CPF já registrado'});
    const validaremail = await emailRegexp.test(email);
    if (validaremail == false)
        return res.status(400).send({error: 'Email cadastrado não existe!'});

    if (cep.length !==9)
        return res.status(400).send({error: 'CEP não existe!'});
    if (cep == "00000-000")
        return res.status(400).send({error: 'CEP não existe!'});

    if (cpf.length !==14)
        return res.status(400).send({error: 'CPF não existe!'});
    if (cpf == "000.000.000-00")
        return res.status(400).send({error: 'CPF não existe!'});
    let per = "Chat";
    try {
        const pass = crypto.randomBytes(3).toString('hex').toLowerCase().slice(0, 5);
        const cliente = await Cpf.create({
            name,
            nascimento,
            cpf,
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
            latitude,
            longitude,
            password: pass,
            role: per,
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
    const {cpf, password} = req.body;

    try {
        const cliente = await Cpf.findOne({cpf}).select('+password');

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
    const {old_password, password, cpf} = req.body;
    try {
        let cliente = await Cpf.findOne({cpf}).select('+password');
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
        nascimento,
        cpf,
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
        latitude,
        longitude} = req.body;

    try {
        await Cpf.updateOne({'cpf': cpf}, {name: name});
        await Cpf.updateOne({'cpf': cpf}, {nascimento: nascimento});
        await Cpf.updateOne({'cpf': cpf}, {ddd: ddd});
        await Cpf.updateOne({'cpf': cpf}, {telefone: telefone});
        await Cpf.updateOne({'cpf': cpf}, {email: email});
        await Cpf.updateOne({'cpf': cpf}, {cep: cep});
        await Cpf.updateOne({'cpf': cpf}, {estado: estado});
        await Cpf.updateOne({'cpf': cpf}, {cidade: cidade});
        await Cpf.updateOne({'cpf': cpf}, {endereco: endereco});
        await Cpf.updateOne({'cpf': cpf}, {numero: numero});
        await Cpf.updateOne({'cpf': cpf}, {complemento: complemento});
        await Cpf.updateOne({'cpf': cpf}, {bairro: bairro});
        await Cpf.updateOne({'cpf': cpf}, {latitude: latitude});
        await Cpf.updateOne({'cpf': cpf}, {longitude: longitude});
        const cliente = await Cpf.findOne({cpf: cpf});
        res.send({
            cliente,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.post('/forgot_password', async (req, res) => {
    const {cpf} = req.body;
    try {
        const cliente = await Cpf.findOne({cpf});
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

router.get('/list', async (req, res) => {
    const {} = req.body;
    try {
        await Cpf.find({}, function(err, docs) {
            if (!err){
                res.send(docs);
                process.exit();
            }
        });
    } catch (err) {
        res.status(400).send({error: 'Busca Falhou'})
    }
});

router.post('/registerpermission', async (req, res) => {
    const {role, cpf} = req.body;
    const user = await Cpf.findOne({cpf});
    if (!user)
        return res.status(400).send({ error: "Usuário não encontrado!" });
    let per = user.role
    try {
        await Promise.all(
            per.map(async p => {
                if ( p == role)
                    return res.send({ error: "Permissão "+ p +" já adicionada!" });
            }));

        await user.role.push(role);
        await user.update({role: per});
        console.log(user.role)
        const update = await Cpf.findOne({cpf});

        return res.send({
            update,
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});
    }
});


module.exports = app => app.use('/franquiadocpf', router);
