import { Bot } from "grammy";
import { handleSpend } from "./handlers/spend";
import { handleIncome } from "./handlers/income";
import { handleStats, handleStatsCallback } from "./handlers/stats";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("spend", handleSpend);
  bot.command("income", handleIncome);
  bot.command("stats", handleStats);

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `<b>Команды:</b>

/spend &lt;сумма&gt; [описание] — добавить трату
  Пример: /spend 500 обед

/income &lt;сумма&gt; [описание] — добавить доход
  Пример: /income 50000 зарплата

/stats — статистика за период

/help — эта справка`,
      { parse_mode: "HTML" }
    );
  });

  bot.on("callback_query:data", handleStatsCallback);

  return bot;
}
