const express = require('express');
const bodyParser =  require('body-parser');
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
    return next();
});


app.use(cors({
    origin: "http://localhost:5022"
}));

app.use(bodyParser.urlencoded({extended:true}));
require('../../App/controllers/')(app);


app.listen(5022, function () {
    console.log('Servidor escutando na porta 5022');
});
