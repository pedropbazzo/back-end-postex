const mongoose = require('../../config/database');
const bcryptjs = require('bcryptjs');

const RastreamentoSchema = new mongoose.Schema({
    atualizacao:[{
        status: String ,
        data: String,
        hora: String,
        local: String,
        uf: String
    }],
    codigo:{
        type: String,
    },
    pedido:{
        type: Number,
        required:[true,'Número do Pedido é Obrigatório'],
    },
    cnpj:{
        type: String,
    },
    cpf:{
        type: String,
    },
    nota_fiscal:{
        type: String,
    },
});

const Rastreamento = mongoose.model('Rastreamento',RastreamentoSchema);

module.exports = Rastreamento;
