const express = require('express');
const path    = require('path');
const { getDb, initDb } = require('./database/db');

// Initialise database (creates + seeds if not present)
initDb();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// ── Home ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const db     = getDb();
  const news   = db.prepare('SELECT * FROM news ORDER BY publish_date DESC LIMIT 3').all();
  const events = db.prepare("SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 3").all();
  db.close();
  res.render('home', { news, events });
});

// ── News list ─────────────────────────────────────────────────
app.get('/news', (req, res) => {
  const db   = getDb();
  const news = db.prepare('SELECT * FROM news ORDER BY publish_date DESC').all();
  db.close();
  res.render('news', { news });
});

// ── News article ──────────────────────────────────────────────
app.get('/news/:slug', (req, res) => {
  const db      = getDb();
  const article = db.prepare('SELECT * FROM news WHERE slug = ?').get(req.params.slug);
  if (!article) { db.close(); return res.status(404).send('Not found'); }
  const related = db.prepare('SELECT * FROM news WHERE id != ? ORDER BY publish_date DESC LIMIT 3').all(article.id);
  db.close();
  res.render('news-detail', { article, related });
});

// ── Events list ───────────────────────────────────────────────
app.get('/events', (req, res) => {
  const db       = getDb();
  const upcoming = db.prepare("SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC").all();
  const past     = db.prepare("SELECT * FROM events WHERE event_date < date('now') ORDER BY event_date DESC").all();
  db.close();
  res.render('events', { upcoming, past });
});

// ── Event detail ──────────────────────────────────────────────
app.get('/events/:slug', (req, res) => {
  const db    = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  db.close();
  if (!event) return res.status(404).send('Not found');
  res.render('event-detail', { event });
});

// ── Contact ───────────────────────────────────────────────────
app.get('/contact', (req, res) => {
  res.render('contact', { sent: false });
});

app.post('/contact', (req, res) => {
  // Phase 2: wire up email sending here
  res.render('contact', { sent: true });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
