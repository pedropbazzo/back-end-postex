const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();
let nodemailer = require('nodemailer');

const Rastreamento = require('../models/Rastreamento');

router.post('/register', async (req, res) => {
    const {data,
        hora,
        local,
        uf,
        pedido,
        cnpj,
        cpf,
        nota_fiscal} = req.body;
    if (await Rastreamento.findOne({pedido}))
        return res.status(400).send({error: 'Já existe rastreamento para esse pedido!'});
    try {
        const max = 99999999;
        const min = 10000000;
        const numero = Math.floor(Math.random() * (max - min)) + min;
        const sequencia = uf + numero + "BR"
        const rastreamento = await Rastreamento.create({
            atualizacao:[{status:"Postado",data:data,hora:hora,local:local,uf:uf}],
            codigo: sequencia,
            pedido,
            cnpj,
            cpf,
            nota_fiscal,
        });

        return res.send({
            rastreamento,
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});
    }

});

router.get('/busca', async (req, res) => {
    const { codigo, nota_fiscal, cpf , cnpj } = req.query;

    try {
        if (codigo != null){
            const rastreamento = await Rastreamento.findOne({codigo});
            if (!rastreamento)
                return res.status(400).send({error: 'Objeto não cadastrado'});
            return res.send({
                rastreamento,
            });
        };
        if (nota_fiscal != null){
            const rastreamento = await Rastreamento.findOne({nota_fiscal});
            if (!rastreamento)
                return res.status(400).send({error: 'Objeto não cadastrado'});
            return res.send({
                rastreamento,
            });
        }
        if (cpf != null){
            await Rastreamento.find({cpf}, function (err, lista) {
                if (!err){
                    return res.send({lista});
                }
            });
        };
        if (cnpj != null){
            await Rastreamento.find({cnpj}, function (err, lista) {
                if (!err){
                    return res.send({lista});
                }
            });
        };

    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'busca Falhou'});
    }
});

router.post('/update', async (req, res) => {
    const {status,
        data,
        hora,
        local,
        uf,
        codigo} = req.body;

    try {
        if (status == ""){
            return res.status(400).send({error: "Status não pode ser vazio"});
        }
        if (data == ""){
            return res.status(400).send({error: "Data não pode ser vazio"});
        }
        if (hora == ""){
            return res.status(400).send({error: "Hora não pode ser vazio"});
        }
        if (local == ""){
            return res.status(400).send({error: "Local não pode ser vazio"});
        }
        if (uf == ""){
            return res.status(400).send({error: "UF não pode ser vazio"});
        }
        const rastreio = await Rastreamento.findOne({codigo:codigo});
        if (!rastreio)
            return res.status(400).send({error: 'Objeto não cadastrado'});
        const conjunto = rastreio.atualizacao;
        await conjunto.push({status:status,data:data,hora:hora,local:local,uf:uf});
        await Rastreamento.updateOne({codigo: codigo}, {atualizacao: conjunto});
        const rastreioup = await Rastreamento.findOne({codigo: codigo});
        res.send({
            rastreioup,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.post('/suspender', async (req, res) => {
    const {codigo} = req.body;

    try {
        let novadata = new Date();
        let dia = novadata.getDate();
        if ( dia < 10){
            dia = "0" + dia
        }
        let mes = novadata.getMonth() + 1;
        if ( mes < 10){
            mes = "0" + mes
        }
        let ano = novadata.getFullYear();
        const data = dia +"/"+mes+"/"+ano;
        let hora = novadata.getHours();
        let minuto = novadata.getMinutes();
        let horario = hora+":"+minuto;
        const rastreio = await Rastreamento.findOne({codigo:codigo});
        if (!rastreio)
            return res.status(400).send({error: 'Objeto não cadastrado'});
        const conjunto = rastreio.atualizacao;
        await Promise.all(
            conjunto.map(async p => {
                if ( p.status == "Suspenção")
                    return res.send({ error: "Já Suspenso" });
            }));
        const local = rastreio.atualizacao[0].local
        const uf = rastreio.atualizacao[0].uf
        await conjunto.push({status:"Suspenção",data:data,hora:horario,local:local,uf:uf});
        await Rastreamento.updateOne({codigo: codigo}, {atualizacao: conjunto});
        const rastreioup = await Rastreamento.findOne({codigo: codigo});
        res.send({
            rastreioup,
        });

    } catch (err) {

        return res.status(400).send({error: 'Atualização Falhou'});
    }
});

router.get('/buscaid', async (req, res) => {
    const { _id } = req.query;

    try {
        const rastreamento = await Rastreamento.findOne({_id});
        if (!rastreamento)
            return res.status(400).send({error: 'Objeto não cadastrado'});
        return res.send({
            rastreamento,
        });


    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'busca Falhou'});
    }
});



module.exports = app => app.use('/rastreamento', router);
