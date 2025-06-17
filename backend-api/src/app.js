const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.json({message: 'ok'
    });
});


// Serve static files
app.use("/public", express.static("public"));


module.exports = app;