const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();
let nodemailer = require('nodemailer');

const Nps = require('../models/Nps');

router.post('/register', async (req, res) => {
    try {
        const novo = await Nps.findOne({comum: 1});
        if (novo)
            return res.send({error: 'Tabelas já Criadas'});

        const Valor = await Nps.create({
            comum: 1,
            total_respondido: 0,
            promotores: 0,
            neutro: 0,
            detratores: 0,
            nps: 0,
            status: null,
        });

        return res.send({
            Valor,
        });
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(400).send({error: 'Registro Falhou'});
    }
});

router.post('/recomendacao', async (req, res) => {
    const {nota} = req.body;

    try {
        if (nota >= 0 & nota <= 6){
            const nps = await Nps.findOne({comum: 1})
            const soma = nps.detratores + 1;
            const adicionar = nps.total_respondido + 1;
            await Nps.updateOne({comum: 1}, {total_respondido: adicionar});
            await Nps.updateOne({comum: 1}, {detratores: soma});
        }
        if (nota >= 7 & nota <= 8){
            const nps = await Nps.findOne({comum: 1})
            const soma = nps.neutro + 1;
            const adicionar = nps.total_respondido + 1;
            await Nps.updateOne({comum: 1}, {total_respondido: adicionar});
            await Nps.updateOne({comum: 1}, {neutro: soma});
        }
        if (nota >= 9 & nota <= 10){
            const nps = await Nps.findOne({comum: 1})
            const soma = nps.promotores + 1;
            const adicionar = nps.total_respondido + 1;
            await Nps.updateOne({comum: 1}, {total_respondido: adicionar});
            await Nps.updateOne({comum: 1}, {promotores: soma});
        }

        const busca = await Nps.findOne({comum: 1});

        //valor do nps
        const promover = (busca.promotores/busca.total_respondido * 100);
        const detrator = (busca.detratores/busca.total_respondido * 100);
        const nps = promover-detrator;
        await Nps.updateOne({comum: 1}, {nps: nps});

        //classificar
        const zona = nps;
        if (zona >= 76){
            await Nps.updateOne({comum: 1}, {status: "Excelência"});
        }
        if (zona >= 51 & zona <= 75){
            await Nps.updateOne({comum: 1}, {status: "Qualidade"});
        }
        if (zona >= 1 & zona <= 50){
            await Nps.updateOne({comum: 1}, {status: "Aperfeiçoamento"});
        }
        if (zona <= 0){
            await Nps.updateOne({comum: 1}, {status: "Crítica"});
        }

        res.send({Sucesso: "Obrigado pela Avaliação"});

    } catch (err) {

        return res.status(400).send({error: 'Recomendação Falhou'});
    }
});

router.get('/list', async (req, res) => {
    try {
        const nps = await Nps.findOne({comum: 1});
        if (!nps){
            return res.send({error: 'Não Encontrado'});
        }
        res.send({nps});

    } catch (err) {

        return res.status(400).send({error: 'Recomendação Falhou'});
    }
});

module.exports = app => app.use('/nps', router);
