require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// connect db
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

// routes
const authRouter = require('./routes/auth');
const readingsRouter = require('./routes/readingroutes');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.use(express.static('./public'));
//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/readings', authenticateUser, readingsRouter);

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
