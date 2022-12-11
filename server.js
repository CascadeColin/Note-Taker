'use strict';

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public'));

app.get('/public/assets/notes', (res, req) => 
    res.sendFile(path.join(__dirname, '/public/assets/notes.html'))
);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));