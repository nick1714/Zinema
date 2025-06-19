const express = require('express');
const cors = require('cors');

const JSend = require("./jsend");
const cinemaRouter = require("./routes/cinema.router");
const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");

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

cinemaRouter.setup(app);

module.exports = app;