import { CommandContext, Context } from "grammy";
import { addTransaction } from "../db";

export async function handleIncome(ctx: CommandContext<Context>) {
  const text = ctx.match;
  if (!text) {
    await ctx.reply(
      "Формат: /income <сумма> [описание]\nПример: /income 50000 зарплата"
    );
    return;
  }

  const parts = text.trim().split(/\s+/);
  const amount = parseFloat(parts[0]);

  if (isNaN(amount) || amount <= 0) {
    await ctx.reply("Сумма должна быть положительным числом.");
    return;
  }

  const description = parts.slice(1).join(" ") || null;
  const chatId = ctx.chat.id;
  const userId = ctx.from!.id;
  const username =
    ctx.from!.first_name || ctx.from!.username || String(userId);

  addTransaction(chatId, userId, username, "income", amount, description);

  const desc = description ? ` — ${description}` : "";
  await ctx.reply(`💰 Доход ${formatNumber(amount)} ₸${desc} записан.`);
}

function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}
