'use strict';

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const data = require('./db/db.json');
const fs = require('fs');
// npm package for creating uuids: https://github.com/uuidjs/uuid
const { v4: uuidv4 } = require('uuid');

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received to get notes`);
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        res.json(JSON.parse(data));
    });
});

// destructures existing note, gets body of existing db.json, then rewrites db.json to include newNote object

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            uuid: uuidv4(),
        };
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) console.error(err);
            const parsedNotes = JSON.parse(data);
            parsedNotes.push(newNote);
            fs.writeFile(
                './db/db.json', 
                JSON.stringify(parsedNotes, null, 3), 
                (err) => {
                    err ? console.error(err) : console.info('Note added successfully!')
                    res.status(201).json(newNote);
                }

            );
        });
        // const response = {
        //     status: 'success',
        //     body: newNote,
        // };
        // console.log(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.get('*',(req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));