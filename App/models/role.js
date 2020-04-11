const mongoose = require('../../config/database');

const RoleSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Nome da Permissão é Obrigatório'],
        minlength:[3,'Deve ter mais de 3 caracteres'],
        maxlength:[40,'Deve possuir menos de 40 caracteres'],
    },
});

const Role = mongoose.model('Role',RoleSchema);

module.exports = Role;
