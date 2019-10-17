const express = require('express');
const path = require('path');

const app = new express();

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname, './index.html'));
});

app.listen(process.env.PORT || 8080);
console.log('Node server running on port 8080');