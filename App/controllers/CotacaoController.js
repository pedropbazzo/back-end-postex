const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const pdf = require('html-pdf');

const authconfig = require('../../config/server/auth');
const mailer = require('../../config/modules/mailer')
const router = express.Router();
let nodemailer = require('nodemailer');

const Cotacao = require('../models/cotacao');
const Rastreamento = require('../models/Rastreamento');

router.post('/registerpdf', async (req, res) => {
    const {cep_origem,
        cep_destino,
        volumes,
        servico_adicional,
        valor_declarado,
        email,
        } = req.body;
    try {
        const cotacao = await Cotacao.create({
            cep_origem,
            cep_destino,
            volumes,
            servico_adicional,
            valor_declarado,
            email,
            status: 'Cotação Gerada',
            valor_total: '0,00'
        });

        const conteudo =
            `
            <div style="width: 595.28px;height: 761px;border: #d3d3d3 solid 2px">
                <div style="position: absolute;height: 692px;width: 595.28px;border-radius: 50px 0 50px 0;background-color: #FFF;margin-top: 30px;x">
                    <div style="padding-left: 202px"><img style="width: 200px" src='https://www.postexexpress.com.br/imagens/LogoSite.jpg'/></div>
                    <div style="padding-left: 50px;padding-right: 50px">
                        <h3 style="color: #FF8C00;font-size: 28px;font-weight: bold;border-bottom: #FF8C00 solid 5px">Cotação</h3>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px">E-mail: ${email}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Cep de Origem: ${cep_origem}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Cep de Destino: ${cep_destino}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Serviços Adicionais: ${servico_adicional}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Volumes:</label><br/>
                        <Table style="width:100%">
                        <tr>
                            <th>QTD</th>
                            <th>Altura</th>
                            <th>Largura</th>
                            <th>Profundidade</th>
                           </tr>
                            ${volumes.map( ( val ) => {
                                return (
                                    `<Table>
                                    <tr>
                                        <td style="padding-left:28px">${val.quantidade}</td>
                                        <td style="padding-left:63px">${val.altura}</td>
                                        <td style="padding-left:85px">${val.largura}</td>
                                        <td style="padding-left:130px">${val.profundidade}</td>
                                    </tr>
                                    </Table>`
                                )})}
                        </Table>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Valor Declarado: ${valor_declarado}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Valor Total: ${valor_total}</label><br/>
                    </div>
                </div>
                <div style="border-top: #023F65 solid 420.1px;border-bottom: #FF8C00  solid 340.9px;">
                </div>
            </div>
            `
        pdf.create(conteudo,{ format: 'Letter' }).toFile("./Cotação("+cotacao.id+").pdf",(err, response) => {
            if(err){
                console.log(err);
            }
            console.log(response);
            let stream = fs.createReadStream("./Cotação("+cotacao.id+").pdf");
            let filename = "Cotação("+cotacao.id+").pdf";
            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            stream.pipe(res);
        });

    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});


    }

});

router.post('/registeremail', async (req, res) => {
    const {cep_origem,
        cep_destino,
        volumes,
        servico_adicional,
        valor_declarado,
        email,
        } = req.body;
    try {
          const atual = await Cotacao.create({
            cep_origem,
            cep_destino,
            volumes,
            servico_adicional,
            valor_declarado,
            email,
              status: 'Cotação Gerada',
             valor_total: '0,00'
        });
        const conteudo =
            `
            <div style="width: 595.28px;height: 761px;border: #d3d3d3 solid 2px">
                <div style="border-top: #023F65 solid 30px">
                <div style="position: absolute;height: 592px;width: 595.28px;border-radius: 50px 0 50px 0;background-color: #FFF;margin-top: 30px;x">
                    <div style="padding-left: 202px"><img style="width: 200px" src='https://www.postexexpress.com.br/imagens/LogoSite.jpg'/></div>
                    <div style="padding-left: 50px;padding-right: 50px">
                        <h3 style="color: #FF8C00;font-size: 28px;font-weight: bold;border-bottom: #FF8C00 solid 5px">Cotação</h3>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px">E-mail: ${email}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Cep de Origem: ${cep_origem}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Cep de Destino: ${cep_destino}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Serviços Adicionais: ${servico_adicional}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Volumes:</label><br/>
                        <Table>
                        <tr>
                            <th style="padding-left:18px">QTD</th>
                            <th style="padding-left:43px">Altura</th>
                            <th style="padding-left:70px">Largura</th>
                            <th style="padding-left:70px">Profundidade</th>
                           </tr>
                           </Table>
                            ${volumes.map( ( val ) => {
                                return (
                                    `<Table>
                                    <tr>
                                        <td style="padding-left:28px">${val.quantidade}</td>
                                        <td style="padding-left:63px">${val.altura}</td>
                                        <td style="padding-left:85px">${val.largura}</td>
                                        <td style="padding-left:130px">${val.profundidade}</td>
                                    </tr>
                                    </Table>`
                            )})}
                        
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Valor Declarado: ${valor_declarado}</label><br/>
                        <label style="font-size: 18px;font-weight: bold;margin: 3px;margin-top: 9px;display:inline-block">Valor Total: ${atual.valor_total}</label><br/>
                    </div>
                </div>
                </div>
            </div>
            `

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
            subject: 'Postex - Cotação',
            text: 'Sua cotação conosco: ',
            html: conteudo
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                return res.status(400).send({error: 'Cannot send forgot password mail / ' + err});
            else
                return res.status(200).send({info});
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
    const { _id } = req.query;

    try {
        await Cotacao.find({user: _id}, function (err, lista) {
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

router.post('/register_id', async (req, res) => {
    const {cep_origem,
        cep_destino,
        volumes,
        servico_adicional,
        valor_declarado,
        email,
        _id} = req.body;
    try {
        const atual =await Cotacao.findOne().sort({ pedido_cotacao: -1});
        let n_pedido = JSON.stringify(atual.pedido_cotacao);
        if (n_pedido == null)
            n_pedido = 0;
        const novo_n_pedido = JSON.stringify(Number(n_pedido) + Number(1));
         const nova = await Cotacao.create({
            cep_origem,
            cep_destino,
            volumes,
            servico_adicional,
            valor_declarado,
            email,
            valor_total: '0,00',
            user: _id,
             status: 'Cotação Gerada',
             pedido_cotacao: novo_n_pedido,
        });
        return res.send(nova);

    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'Registro Falhou'});


    }

});

router.post('/buy_code', async (req, res) => {
    const { cotacao_id,
        local,
        uf,
        cpf,
        cnpj,
        nota_fiscal} = req.body;
    try {
        //buscar a cotação que vai virar pedido
        const cotacao = await Cotacao.findOne({_id:cotacao_id});

        //achar o ultimo pedido e adicionar +1
        const atual =await Cotacao.findOne().sort({ pedido: -1});
        let n_pedido = JSON.stringify(atual.pedido);
        if (n_pedido == null)
            n_pedido = 0;
        const novo_n_pedido = JSON.stringify(Number(n_pedido) + Number(1));
        if (await Rastreamento.findOne({pedido: novo_n_pedido}))
            return res.status(400).send({error: 'Já existe rastreamento para esse pedido!'});

        // gerar rastreio
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
        const max = 99999999;
        const min = 10000000;
        const numero = Math.floor(Math.random() * (max - min)) + min;
        const sequencia = uf + numero + "BR"
        const rastreamento = await Rastreamento.create({
            atualizacao:[{status:"Remessa Criada",data:data,hora:horario,local:local,uf:uf}],
            codigo: sequencia,
            pedido: novo_n_pedido,
            cnpj,
            cpf,
            nota_fiscal,
        });

        //atualizar a cotacao para pedido
        await Cotacao.updateOne({'_id': cotacao_id}, {rastreamento: rastreamento._id});
        await Cotacao.updateOne({'_id': cotacao_id}, {pedido: novo_n_pedido});
        await Cotacao.updateOne({'_id': cotacao_id}, {status: 'Em envio'});
        const cotacaoatual = await Cotacao.findOne({_id:cotacao_id});

        return res.send(cotacaoatual);

    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(400).send({error: 'Registro Falhou'});
    }

});

router.get('/progress', async (req, res) => {
    const { _id } = req.query;

    try {
        const progress = await Cotacao.find({user: _id,status: 'Em envio'})
        return res.send({progress});
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'busca Falhou'});
    }
});

router.get('/pending', async (req, res) => {
    const { _id } = req.query;

    try {
        const pending = await Cotacao.find({user: _id,status: 'Cotação Gerada'})
        return res.send({pending});
    } catch (err) {
        if (err.name == 'ValidationError')
            return res.status(400).send({error: err.message});
        console.log(err);
        return res.status(413).send({error: err.message});
        return res.status(400).send({error: 'busca Falhou'});
    }
});

module.exports = app => app.use('/cotacao', router);
