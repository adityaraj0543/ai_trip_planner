import mongoose from 'mongoose';
import Trip from '../models/Trip.js';

const editableFields = [
  'destination',
  'startDate',
  'endDate',
  'days',
  'nights',
  'travelers',
  'budget',
  'status',
  'image',
  'weather',
  'activities',
  'travelStyle',
  'notes',
];

function invalid(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validDate(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
    && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function tripFields(body, { partial = false } = {}) {
  const fields = {};
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) fields[field] = body[field];
  }

  if (!partial || Object.hasOwn(fields, 'destination')) {
    if (typeof fields.destination !== 'string' || !fields.destination.trim() || fields.destination.length > 150) {
      throw invalid('Destination is required and must be 150 characters or fewer.');
    }
    fields.destination = fields.destination.trim();
  }

  if (!partial || Object.hasOwn(fields, 'startDate')) {
    if (!validDate(fields.startDate)) throw invalid('A valid start date (YYYY-MM-DD) is required.');
  }
  if (!partial || Object.hasOwn(fields, 'endDate')) {
    if (!validDate(fields.endDate)) throw invalid('A valid end date (YYYY-MM-DD) is required.');
  }
  if (fields.startDate && fields.endDate && fields.endDate < fields.startDate) {
    throw invalid('End date must be on or after the start date.');
  }

  for (const field of ['days', 'nights', 'travelers', 'budget']) {
    if (!Object.hasOwn(fields, field)) continue;
    if (!Number.isFinite(fields[field])) throw invalid(`${field} must be a number.`);
  }
  if (fields.days !== undefined && (!Number.isInteger(fields.days) || fields.days < 1 || fields.days > 30)) {
    throw invalid('Trip duration must be between 1 and 30 days.');
  }
  if (fields.nights !== undefined && (!Number.isInteger(fields.nights) || fields.nights < 0 || fields.nights > 29)) {
    throw invalid('Trip nights must be between 0 and 29.');
  }
  if (fields.travelers !== undefined && (!Number.isInteger(fields.travelers) || fields.travelers < 1 || fields.travelers > 20)) {
    throw invalid('Travelers must be between 1 and 20.');
  }
  if (fields.budget !== undefined && (fields.budget <= 0 || fields.budget > 10000000)) {
    throw invalid('Budget must be a positive amount no greater than 10000000.');
  }
  if (fields.status !== undefined && !['planned', 'confirmed', 'draft'].includes(fields.status)) {
    throw invalid('Trip status is invalid.');
  }
  if (fields.activities !== undefined && (!Array.isArray(fields.activities) || fields.activities.length > 100
    || fields.activities.some((activity) => typeof activity !== 'string' || activity.length > 200))) {
    throw invalid('Activities must be a list of up to 100 short text values.');
  }
  if (fields.travelStyle !== undefined && (!Array.isArray(fields.travelStyle) || fields.travelStyle.length > 20
    || fields.travelStyle.some((style) => typeof style !== 'string' || style.length > 50))) {
    throw invalid('Travel styles must be a list of up to 20 short text values.');
  }
  if (fields.notes !== undefined && (typeof fields.notes !== 'string' || fields.notes.length > 2000)) {
    throw invalid('Trip notes must be 2000 characters or fewer.');
  }
  if (fields.image !== undefined && (typeof fields.image !== 'string' || fields.image.length > 1000)) {
    throw invalid('Trip image URL must be 1000 characters or fewer.');
  }
  if (fields.weather !== undefined) {
    if (!fields.weather || typeof fields.weather !== 'object' || Array.isArray(fields.weather)) {
      throw invalid('Trip weather must be an object.');
    }
    const { temp, condition, icon } = fields.weather;
    if (!Number.isFinite(temp) || typeof condition !== 'string' || typeof icon !== 'string') {
      throw invalid('Trip weather must include a numeric temperature, condition, and icon.');
    }
    fields.weather = { temp, condition: condition.slice(0, 100), icon: icon.slice(0, 20) };
  }

  return fields;
}

export async function listTrips(req, res) {
  const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ success: true, trips });
}

export async function createTrip(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const fields = tripFields(body);
  const trip = await Trip.create({ ...fields, userId: req.user.id });
  return res.status(201).json({ success: true, trip });
}

export async function getTrip(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  return res.json({ success: true, trip });
}

export async function updateTrip(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const fields = tripFields(body, { partial: true });
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ success: false, message: 'Provide at least one supported trip field to update.' });
  }
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: fields },
    { new: true, runValidators: true },
  );
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  return res.json({ success: true, trip });
}

export async function deleteTrip(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  return res.json({ success: true, id: req.params.id });
}
