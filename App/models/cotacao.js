const mongoose = require('../../config/database');

const CotacaoSchema = new mongoose.Schema({
    user:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    rastreamento:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Rastreamento',
    }],
    pedido:{
        type: Number,
    },
    pedido_cotacao:{
        type: Number,
    },
    cep_origem:{
        type: String,
        required: [true,'Cep de Origem é Obrigatório'],
    },
    cep_destino:{
        type: String,
        required: [true,'Cep de Destino é Obrigatório'],
    },
    volumes:[{
        quantidade: Number ,
        altura: Number,
        largura: Number,
        profundidade: Number,
    }],
    servico_adicional:[{
        type: String,
    }],
    valor_declarado:{
        type: String,
        required:[true,'Valor é Obrigatório'],
    },
    email:{
        type: String,
        required:[true,'Email é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    valor_total:{
        type: String,
    },
    status:{
        type: String,
    },
});

const Cotacao = mongoose.model('Cotacao',CotacaoSchema);

module.exports = Cotacao;
