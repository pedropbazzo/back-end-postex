const mongoose = require('../../config/database');
const bcryptjs = require('bcryptjs');

const SejaFranqueadoCNPJSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Nome é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    fundacao:{
        type: String,
        required:[true,'Data de Fundação é Obrigatório'],
    },
    cnpj:{
        type: String,
        required:[true,'CNPJ é Obrigatório'],
        minlength:[14,'Deve ter mais de 13 caracteres'],
        maxlength:[18,'Deve possuir menos de 19 caracteres'],
    },
    ddd:{
        type: String,
    },
    telefone:{
        type: String,
        required:[true,'Telefone é Obrigatório'],
        minlength:[9,'Deve ter mais de 8 caracteres'],
        maxlength:[10,'Deve possuir menos de 11 caracteres'],
    },
    email:{
        type: String,
        required:[true,'Email é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    cep:{
        type: String,
        required:[true,'CEP é Obrigatório'],
        minlength:[8,'Deve ter mais de 7 caracteres'],
        maxlength:[9,'Deve possuir menos de 10 caracteres'],
    },
    estado:{
        type: String,
        required:[true,'Estado é Obrigatório'],
    },
    cidade:{
        type: String,
        required:[true,'Cidade é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    endereco:{
        type: String,
        required:[true,'Endereço é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    numero:{
        type: String,
        required:[true,'Número é Obrigatório'],
        maxlength:[10,'Deve possuir menos de 11 caracteres'],
    },
    complemento:{
        type: String
    },
    bairro:{
        type: String,
        required:[true,'Bairro é Obrigatório'],
        minlength:[3,'Deve ter mais de 2 caracteres'],
        maxlength:[40,'Deve possuir menos de 41 caracteres'],
    },
    latitude:{
        type: Number,
        required:[true,'Latitude é Obrigatório'],
    },
    longitude:{
        type: Number,
        required:[true,'Longitude é Obrigatório'],
    },
    password:{
        type: String,
        required: true,
    },
    role:[{
        type: String,
    }],
    created_At:{
        type: Date,
        default: Date.now,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },

    passwordResetExpiresAt: {
        type: Date,
        select: false
    },
});

SejaFranqueadoCNPJSchema.pre('save', function (next) {

    this.password = bcryptjs.hashSync(this.password);
    next();
});

const SejaFranqueadoCNPJ = mongoose.model('SejaFranqueadoCNPJ',SejaFranqueadoCNPJSchema);

module.exports = SejaFranqueadoCNPJ;
