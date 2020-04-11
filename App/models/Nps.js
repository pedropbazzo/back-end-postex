const mongoose = require('../../config/database');

const npsSchema = new mongoose.Schema({
    total_respondido:{
        type: Number,
    },
    promotores:{
        type: Number,
    },
    neutro:{
        type: Number,
    },
    detratores:{
        type: Number,
    },
    nps:{
        type: Number,
    },
    comum:{
        type: Number,
    },
    status:{
        type: String,
    },
});

const Nps = mongoose.model('Nps',npsSchema);

module.exports = Nps;
