const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());


const uri = 'mongodb://127.0.0.1:27017/remind-me-later';


// MongoDB connection
const client = new MongoClient(uri);


let remindersCollection;

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db('reminderApp'); // DB name
    remindersCollection = db.collection('reminders');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
}

// GET all reminders
app.get('/api/reminders', async (req, res) => {
  try {
    const reminders = await remindersCollection.find().toArray();
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST a new reminder
app.post('/api/reminders', async (req, res) => {
  const { date, time, message, method } = req.body;

  if (!date || !time || !message || !method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newReminder = {
    date,
    time,
    message,
    method,
    createdAt: new Date()
  };

  try {
    const result = await remindersCollection.insertOne(newReminder);
    res.status(201).json({ message: 'Reminder saved!', reminder: result.ops?.[0] || newReminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save reminder' });
  }
});

// Start the server after Mongo connects
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
