const mongoose = require('mongoose');
var url = 'mongodb+srv://postex:Teste123@cluster0-a4vez.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.set(`useFindAndModify`, false);
module.exports = mongoose;
