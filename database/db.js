const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'site.db');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      slug         TEXT UNIQUE NOT NULL,
      subtitle     TEXT,
      content      TEXT,
      image        TEXT,
      publish_date TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      subtitle    TEXT,
      description TEXT,
      location    TEXT,
      event_date  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed news if empty
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get();
  if (newsCount.count === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (title, slug, subtitle, content, publish_date)
      VALUES (@title, @slug, @subtitle, @content, @publish_date)
    `);
    const seedNews = [
      {
        title: 'Squad Announced for 2027 Campaign',
        slug: slugify('Squad Announced for 2027 Campaign'),
        subtitle: 'Final selections confirmed following national trials',
        content: '<p>The 2027 NZ Elite Womens Underwater Hockey squad has been confirmed following an intensive national trials period. The squad will represent New Zealand at the 2027 World Championships.</p><p>Head coach has praised the depth and quality shown during the selection process, noting the high standard of competition for places in the final squad.</p>',
        publish_date: '2026-05-01'
      },
      {
        title: 'Training Camp Recap – Auckland',
        slug: slugify('Training Camp Recap Auckland'),
        subtitle: 'High-intensity weekend focuses on defensive systems',
        content: '<p>The squad gathered in Auckland for an intensive weekend training camp focused on refining defensive structures ahead of the international campaign.</p><p>Players worked through a series of high-pressure drills designed to simulate World Championship match conditions.</p>',
        publish_date: '2026-04-20'
      },
      {
        title: 'International Series Confirmed',
        slug: slugify('International Series Confirmed'),
        subtitle: 'NZ squad to face Australia in pre-worlds test matches',
        content: '<p>A Trans-Tasman test series has been confirmed, with the NZ squad set to face Australia in a series of matches in the lead-up to the 2027 World Championships.</p><p>The series will provide valuable preparation and competition experience for squad members.</p>',
        publish_date: '2026-04-10'
      }
    ];
    seedNews.forEach(n => insertNews.run(n));
  }

  // Seed events if empty
  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
  if (eventsCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, slug, subtitle, description, location, event_date)
      VALUES (@title, @slug, @subtitle, @description, @location, @event_date)
    `);
    const seedEvents = [
      {
        title: 'National Training Camp – Auckland',
        slug: slugify('National Training Camp Auckland'),
        subtitle: 'Final preparation block before selections',
        description: '<p>The final national training camp before squad selections. All trialists and current squad members are expected to attend. Sessions will focus on team structure, set pieces, and match fitness.</p>',
        location: 'Auckland',
        event_date: '2026-05-12'
      },
      {
        title: 'Trans-Tasman Series',
        slug: slugify('Trans-Tasman Series'),
        subtitle: 'NZ vs Australia test matches confirmed',
        description: '<p>A multi-game test series against Australia. This is a key preparation event for the World Championships, offering the squad high-quality international match experience.</p>',
        location: 'Wellington',
        event_date: '2026-06-28'
      },
      {
        title: 'Final Squad Selection Camp',
        slug: slugify('Final Squad Selection Camp'),
        subtitle: 'Last evaluation phase before Worlds squad naming',
        description: '<p>The final selection camp before the official World Championships squad is named. Performance in this camp will be a key factor in final squad decisions.</p>',
        location: 'Christchurch',
        event_date: '2026-08-15'
      }
    ];
    seedEvents.forEach(e => insertEvent.run(e));
  }

  db.close();
}

module.exports = { getDb, initDb };
