require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// connect db
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

// routes
const authRouter = require('./routes/auth');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

//routes
app.use('/api/v1/auth', authRouter);
//Now you can add more routes that require authentication like this:
app.get('/', authenticateUser, (req, res) => {
  res.send('All your secured routes here');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
