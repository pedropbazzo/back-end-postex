const mongoose = require('../../config/database');

const PostagemSchema = new mongoose.Schema({
    titulo:{
        type: String,
    },
    conteudo : [{
        type : String ,
    }],
});

const Postagem = mongoose.model('Postagem',PostagemSchema);

module.exports = Postagem;
