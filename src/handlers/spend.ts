import { CommandContext, Context } from "grammy";
import { addTransaction } from "../db";

export async function handleSpend(ctx: CommandContext<Context>) {
  const text = ctx.match;
  if (!text) {
    await ctx.reply("Формат: /spend <сумма> [описание]\nПример: /spend 500 обед");
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

  addTransaction(chatId, userId, username, "expense", amount, description);

  const desc = description ? ` — ${description}` : "";
  await ctx.reply(`💸 Трата ${formatNumber(amount)} ₸${desc} записана.`);
}

function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}
