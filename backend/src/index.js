const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const amqplib = require('amqplib');
const axios = require('axios');

const {
  PORT = 4000,
  RABBITMQ_URL,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET
} = process.env;

function createPool(prefix) {
  return new Pool({
    host: process.env[`${prefix}_DB_HOST`],
    port: process.env[`${prefix}_DB_PORT`],
    database: process.env[`${prefix}_DB_NAME`],
    user: process.env[`${prefix}_DB_USER`],
    password: process.env[`${prefix}_DB_PASSWORD`],
  });
}

const studentsPool = createPool('STUDENTS');
const parentsPool = createPool('PARENTS');
const teachersPool = createPool('TEACHERS');

const app = express();
app.use(cors());
app.use(express.json());

let amqpChannel = null;

// Connect to RabbitMQ
async function initRabbit() {
  if (!RABBITMQ_URL) return;
  const conn = await amqplib.connect(RABBITMQ_URL);
  amqpChannel = await conn.createChannel();
  await amqpChannel.assertQueue('events', { durable: false });
  console.log('Connected to RabbitMQ');
}

async function ensureTables() {
  await studentsPool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, enrolled BOOLEAN DEFAULT TRUE
    );
  `);
  await parentsPool.query(`
    CREATE TABLE IF NOT EXISTS parents (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, child_name TEXT
    );
  `);
  await teachersPool.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, subject TEXT
    );
  `);
}

// Basic Keycloak token introspection middleware (optional, skip if no credentials)
async function verifyTokenMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No Authorization header' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  if (!KEYCLOAK_URL || !KEYCLOAK_CLIENT_ID || !KEYCLOAK_CLIENT_SECRET) {
    // If Keycloak not configured, let it through (dev mode).
    return next();
  }

  try {
    const url = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`;
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('client_id', KEYCLOAK_CLIENT_ID);
    params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    const resp = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (resp.data?.active) {
      // optionally set req.user info
      req.user = resp.data;
      next();
    } else {
      return res.status(401).json({ error: 'Token not active' });
    }
  } catch (err) {
    console.error('Keycloak introspection error:', err.message);
    return res.status(500).json({ error: 'Token verification failed' });
  }
}

// Basic endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Students
app.get('/students', verifyTokenMiddleware, async (req, res) => {
  const { rows } = await studentsPool.query('SELECT * FROM students ORDER BY id ASC');
  res.json(rows);
});
app.post('/students', verifyTokenMiddleware, async (req, res) => {
  const { name, enrolled = true } = req.body;
  const { rows } = await studentsPool.query('INSERT INTO students(name, enrolled) VALUES($1, $2) RETURNING *', [name, enrolled]);
  // publish event to queue
  if (amqpChannel) {
    amqpChannel.sendToQueue('events', Buffer.from(JSON.stringify({ event: 'student_created', data: rows[0] })));
  }
  res.status(201).json(rows[0]);
});

// Teachers
app.get('/teachers', verifyTokenMiddleware, async (req, res) => {
  const { rows } = await teachersPool.query('SELECT * FROM teachers ORDER BY id ASC');
  res.json(rows);
});
app.post('/teachers', verifyTokenMiddleware, async (req, res) => {
  const { name, subject } = req.body;
  const { rows } = await teachersPool.query('INSERT INTO teachers(name, subject) VALUES($1, $2) RETURNING *', [name, subject]);
  if (amqpChannel) {
    amqpChannel.sendToQueue('events', Buffer.from(JSON.stringify({ event: 'teacher_created', data: rows[0] })));
  }
  res.status(201).json(rows[0]);
});

// Parents
app.get('/parents', verifyTokenMiddleware, async (req, res) => {
  const { rows } = await parentsPool.query('SELECT * FROM parents ORDER BY id ASC');
  res.json(rows);
});
app.post('/parents', verifyTokenMiddleware, async (req, res) => {
  const { name, child_name } = req.body;
  const { rows } = await parentsPool.query('INSERT INTO parents(name, child_name) VALUES($1, $2) RETURNING *', [name, child_name]);
  if (amqpChannel) {
    amqpChannel.sendToQueue('events', Buffer.from(JSON.stringify({ event: 'parent_created', data: rows[0] })));
  }
  res.status(201).json(rows[0]);
});

async function start() {
  try {
    await initRabbit();
    await ensureTables();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

start();

// Simple shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
