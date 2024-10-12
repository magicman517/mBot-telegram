import { DB } from 'https://deno.land/x/sqlite/mod.ts';

Deno.mkdir("databases")
    // folder already exists
    .catch(() => { });

export const usersDb = new DB('databases/users.db');
export const contextDb = new DB('databases/context.db');

usersDb.query(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        text_model TEXT NOT NULL,
        audio_model TEXT NOT NULL
    )
`);

contextDb.query(`
    CREATE TABLE IF NOT EXISTS context (
        user_id INTEGER PRIMERY KEY,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        image TEXT
    )
`);
