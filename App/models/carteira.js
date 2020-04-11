const mongoose = require('../../config/database');
const bcryptjs = require('bcryptjs');

const carteiraSchema = new mongoose.Schema({
    user:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    data:{
        type: String,
    },
    valor:{
        type: String,
    },
});


const Carteira = mongoose.model('Carteira',carteiraSchema);

module.exports = Carteira;
