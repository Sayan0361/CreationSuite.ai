import {neon} from "@neondatabase/serverless"

const sql = neon(`${process.env.DATABASE_URL}`);

export default sql;

// Neon DB : 
//  CREATE TABLE Creations (
//     id SERIAL PRIMARY KEY,
//     user_id TEXT NOT NULL,
//     prompt TEXT NOT NULL,
//     content TEXT NOT NULL,
//     type TEXT NOT NULL,
//     publish BOOLEAN DEFAULT FALSE,
//     likes TEXT[] DEFAULT '{}',
//     created_at TIMESTAMPTZ DEFAULT NOW(),
//     updated_at TIMESTAMPTZ DEFAULT NOW()
// );