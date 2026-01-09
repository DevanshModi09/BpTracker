const Readings = require('../models/Readings');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const getAllReadings = async (req, res) => {
  const readings = await Readings.find({ CreatedBy: req.user.userId }).sort(
    'createdAt'
  );
  res.status(StatusCodes.OK).json({ readings, count: readings.length });
};

const createReading = async (req, res) => {
  const reading = await Readings.create({
    ...req.body,
    CreatedBy: req.user.userId,
  });
  res.status(StatusCodes.CREATED).json({ reading });
};

// const getReading = async (req, res) => {};

module.exports = {
  getAllReadings,
  createReading
};
