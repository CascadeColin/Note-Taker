'use strict';

const express = require('express');
const path = require('path');
const app = express();

// sets PORT for Heroku, or 3001 if developing on localhost
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
            id: uuidv4(),
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
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        console.info(`${req.method} request received to delete note ID: ${req.params.id}`);
        // stores selected note to delete
        const noteId = req.params.id;
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            const parsedNotes = JSON.parse(data);
            // filters out any notes that have an id that matches the query request id
            const updatedNotes = parsedNotes.filter((note) => {
                return noteId !== note.id;
            })
            // overwrites db.json with new string that has the filtered notes removed
            fs.writeFile(
                './db/db.json', 
                JSON.stringify(updatedNotes, null, 3), 
                (err) => {
                    err ? console.error(err) : console.info('Note deleted successfully!')
                    res.status(201).json(updatedNotes);
                }
            );
        })
    }
});

app.get('*',(req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));