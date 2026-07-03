"use client";

import { useEffect, useMemo, useState } from 'react';

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Unable to load expenses.');
      }
      const data: Expense[] = await response.json();
      setExpenses(data);
    } catch {
      setError('Failed to load expenses. Confirm your Neon DB is configured in Vercel.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExpense() {
    const parsedAmount = Number(amount);
    if (!description.trim() || !date || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: parsedAmount,
          category,
          date,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Could not save expense.');
      }

      const savedExpense: Expense = await response.json();
      setExpenses(prev => [savedExpense, ...prev]);
      setDescription('');
      setAmount('');
      setCategory(categories[0]);
      setDate('');
    } catch {
      setError('Failed to save expense. Confirm your Neon DB URL is set in Vercel.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setError('');

    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Could not remove expense.');
      }

      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch {
      setError('Failed to remove expense.');
    }
  }

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const totalsByCategory = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 rounded-3xl bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20 ring-1 ring-slate-700">
          <h1 className="text-4xl font-semibold">Expense Tracker</h1>
          <p className="mt-3 max-w-2xl text-slate-300 sm:text-lg">
            Track your spending with Neon and Vercel.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6 rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Add a new expense</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Description</span>
                  <input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="Coffee, groceries, rent..."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Amount</span>
                  <input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="25.00"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Category</span>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  >
                    {categories.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleAddExpense}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save expense'}
              </button>
            </div>

            {error ? (
              <div className="rounded-3xl bg-rose-950/80 p-4 text-rose-200 ring-1 ring-rose-700">
                {error}
              </div>
            ) : null}

            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700">
              <h3 className="text-xl font-semibold">Recent expenses</h3>
              {loading ? (
                <p className="mt-4 text-slate-400">Loading expenses…</p>
              ) : expenses.length === 0 ? (
                <p className="mt-4 text-slate-400">No expenses yet. Add a transaction to get started.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {expenses.map(expense => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-100">{expense.description}</p>
                        <p className="text-sm text-slate-400">
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-cyan-300">${expense.amount.toFixed(2)}</p>
                        <button
                          type="button"
                          onClick={() => handleRemove(expense.id)}
                          className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl bg-slate-900/80 p-8 ring-1 ring-slate-700">
            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700">
              <h2 className="text-2xl font-semibold">Summary</h2>
              <p className="mt-3 text-slate-400">Total spent</p>
              <p className="mt-2 text-4xl font-semibold text-cyan-300">${total.toFixed(2)}</p>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700">
              <h2 className="text-2xl font-semibold">By category</h2>
              <div className="mt-4 space-y-3">
                {categories.map(item => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3">
                    <span className="text-sm text-slate-300">{item}</span>
                    <span className="font-semibold text-slate-100">${(totalsByCategory[item] ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
