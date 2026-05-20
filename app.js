require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/zentodo';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.warn('⚠️  MongoDB not connected (running without DB):', err.message));

// Todo Schema
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', todoSchema);

// In-memory fallback if MongoDB isn't available
let memoryTodos = [];
let memoryId = 1;

const useDB = () => mongoose.connection.readyState === 1;

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: useDB() ? 'mongodb' : 'in-memory',
    uptime: process.uptime().toFixed(2) + 's'
  });
});

app.get('/api/todos', async (req, res) => {
  try {
    if (useDB()) {
      const todos = await Todo.find().sort({ createdAt: -1 });
      return res.json(todos);
    }
    res.json(memoryTodos.slice().reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
  try {
    if (useDB()) {
      const todo = await Todo.create({ text: text.trim() });
      return res.status(201).json(todo);
    }
    const todo = { _id: String(memoryId++), text: text.trim(), done: false, createdAt: new Date() };
    memoryTodos.push(todo);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    if (useDB()) {
      const todo = await Todo.findByIdAndUpdate(req.params.id, { done: req.body.done }, { new: true });
      if (!todo) return res.status(404).json({ error: 'Not found' });
      return res.json(todo);
    }
    const todo = memoryTodos.find(t => t._id === req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    todo.done = req.body.done;
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    if (useDB()) {
      await Todo.findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    }
    memoryTodos = memoryTodos.filter(t => t._id !== req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only start the server when run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌿 Zen Todo running at http://localhost:${PORT}`);
  });
}

module.exports = app;
