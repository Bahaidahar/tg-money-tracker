import { Database } from "bun:sqlite";
import path from "path";

const db = new Database(path.join(process.cwd(), "spend.db"));

db.run("PRAGMA journal_mode = WAL");

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    username TEXT,
    type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
    amount REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Transaction {
  id: number;
  chat_id: number;
  user_id: number;
  username: string | null;
  type: "expense" | "income";
  amount: number;
  description: string | null;
  created_at: string;
}

const insertStmt = db.prepare(`
  INSERT INTO transactions (chat_id, user_id, username, type, amount, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export function addTransaction(
  chatId: number,
  userId: number,
  username: string | null,
  type: "expense" | "income",
  amount: number,
  description: string | null
): void {
  insertStmt.run(chatId, userId, username, type, amount, description);
}

export function getTransactions(
  chatId: number,
  from: Date,
  to: Date
): Transaction[] {
  const stmt = db.prepare(`
    SELECT * FROM transactions
    WHERE chat_id = ? AND created_at >= ? AND created_at < ?
    ORDER BY created_at DESC
  `);
  return stmt.all(
    chatId,
    from.toISOString(),
    to.toISOString()
  ) as Transaction[];
}

export default db;
