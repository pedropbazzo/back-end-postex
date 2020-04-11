const mongoose = require('../../config/database');

const MensagemSchema = new mongoose.Schema({
    nome:{
        type: String,
    },
    email:{
        type: String,
    },
    telefone:{
        type: String,
    },
    assunto:{
        type: String,
    },
    conteudo:{
        type: String,
    },
});

const Mensagem = mongoose.model('Mensagem',MensagemSchema);

module.exports = Mensagem;
