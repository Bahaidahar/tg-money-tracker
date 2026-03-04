import { CommandContext, Context } from "grammy";
import { InlineKeyboard } from "grammy";
import { getTransactions, Transaction } from "../db";

export async function handleStats(ctx: CommandContext<Context>) {
  const keyboard = new InlineKeyboard()
    .text("Сегодня", "stats:today")
    .text("Вчера", "stats:yesterday")
    .row()
    .text("Неделя", "stats:week")
    .text("Месяц", "stats:month");

  await ctx.reply("Выберите период:", { reply_markup: keyboard });
}

export async function handleStatsCallback(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data?.startsWith("stats:")) return;

  const period = data.replace("stats:", "");
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const { from, to, label } = getDateRange(period);
  const transactions = getTransactions(chatId, from, to);

  const text = formatStats(transactions, label);

  await ctx.callbackQuery!.message
    ? await ctx.editMessageText(text, { parse_mode: "HTML" })
    : await ctx.reply(text, { parse_mode: "HTML" });

  await ctx.answerCallbackQuery();
}

function getDateRange(period: string): {
  from: Date;
  to: Date;
  label: string;
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "yesterday": {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 1);
      return { from, to: todayStart, label: "вчера" };
    }
    case "week": {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 7);
      return { from, to: new Date(now.getTime() + 86400000), label: "неделю" };
    }
    case "month": {
      const from = new Date(todayStart);
      from.setMonth(from.getMonth() - 1);
      return { from, to: new Date(now.getTime() + 86400000), label: "месяц" };
    }
    default: {
      return {
        from: todayStart,
        to: new Date(now.getTime() + 86400000),
        label: "сегодня",
      };
    }
  }
}

function formatStats(transactions: Transaction[], label: string): string {
  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  let text = `📊 <b>Статистика за ${label}:</b>\n\n`;

  text += `💸 <b>Траты: ${fmt(totalExpense)} ₸</b>\n`;
  if (expenses.length > 0) {
    for (const t of expenses) {
      const desc = t.description || "без описания";
      text += `  • ${fmt(t.amount)} — ${desc} (${t.username})\n`;
    }
  } else {
    text += `  Нет трат\n`;
  }

  text += `\n💰 <b>Доходы: ${fmt(totalIncome)} ₸</b>\n`;
  if (incomes.length > 0) {
    for (const t of incomes) {
      const desc = t.description || "без описания";
      text += `  • ${fmt(t.amount)} — ${desc} (${t.username})\n`;
    }
  } else {
    text += `  Нет доходов\n`;
  }

  const sign = balance >= 0 ? "+" : "";
  text += `\n📈 <b>Баланс: ${sign}${fmt(balance)} ₸</b>`;

  return text;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}
