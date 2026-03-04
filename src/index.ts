import "dotenv/config";
import { createBot } from "./bot";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is not set in .env");
  process.exit(1);
}

const bot = createBot(token);

await bot.api.setMyCommands([
  { command: "spend", description: "Добавить трату: /spend 500 обед" },
  { command: "income", description: "Добавить доход: /income 50000 зарплата" },
  { command: "stats", description: "Статистика за период" },
  { command: "help", description: "Справка по командам" },
]);

const port = process.env.PORT || 3000;
Bun.serve({
  port,
  fetch: () => new Response("OK"),
});

bot.start({
  onStart: () => console.log("Bot is running..."),
});
