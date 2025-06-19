const express = require('express');
const cors = require('cors');

const JSend = require("./jsend");
const cinemaRouter = require("./routes/cinema.router");
const movieRouter = require("./routes/movie.router");
const showtimeRouter = require("./routes/showtime.router");
const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.json(JSend.success({ message: 'Cinema Management API' }));
});

// Serve static files
app.use("/public", express.static("public"));

// Setup routes
cinemaRouter.setup(app);
movieRouter.setup(app);
showtimeRouter.setup(app);

// 404 handler - must be after all routes
app.use(resourceNotFound);

// Error handling middleware - must be last
app.use(handleError);

module.exports = app;