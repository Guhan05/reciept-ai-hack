import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* ReceiptAIProDemo.jsx
   - Save as src/ReceiptAIProDemo.jsx
   - Requires: recharts (npm i recharts)
   - Tailwind optional (styles in code use Tailwind classes)
*/

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B", "#EF4444", "#10B981"];

export default function ReceiptAIProDemo() {
  const [transactions, setTransactions] = useState([
    { id: 1, date: daysAgo(1), merchant: "Demo Market", category: "Groceries", amount: -320.0, mode: "Card" },
    { id: 2, date: daysAgo(2), merchant: "Payroll", category: "Income", amount: 5000.0, mode: "Bank" },
    { id: 3, date: daysAgo(3), merchant: "Corner Cafe", category: "Dining", amount: -150.0, mode: "Cash" },
    { id: 4, date: daysAgo(7), merchant: "Metro", category: "Transport", amount: -90.0, mode: "Card" },
    { id: 5, date: daysAgo(10), merchant: "Streaming Co", category: "Subscriptions", amount: -60.0, mode: "Card" },
  ]);

  const [bankBalance, setBankBalance] = useState(2000);
  const [cashBalance, setCashBalance] = useState(500);

  const [scannedText, setScannedText] = useState("");
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [vaultReceipts, setVaultReceipts] = useState([]);
  const [vaultPin, setVaultPin] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ from: "assistant", text: "Welcome — demo with receipts, EMI, gamification, vault & donation." }]);

  const [goals, setGoals] = useState([{ id: 1, title: "New Phone", target: 20000, saved: 4000, dueInMonths: 6, achieved: false }]);

  const [autoBudget, setAutoBudget] = useState([]);
  const [emiSchedule, setEmiSchedule] = useState([{ id: 1, merchant: "iPhone EMI", amount: 4000, nextDueDays: 12 }]);
  const [emiInput, setEmiInput] = useState(0);
  const [emiResult, setEmiResult] = useState(null);

  const [points, setPoints] = useState(120);
  const [level, setLevel] = useState("Budget Rookie");
  const [badges, setBadges] = useState(["Starter"]);
  const [saveStreak, setSaveStreak] = useState(2);

  const [donationSuggestion, setDonationSuggestion] = useState(null);

  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalBalance = bankBalance + cashBalance;

  const spendByCategory = aggregateByCategory(transactions);
  const weeklySeries = makeWeeklySeries(transactions);

  useEffect(() => {
    setAutoBudget(computeAutoBudget(totalIncome, transactions));
    computeDonationSuggestion();
    updateGamification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalIncome, transactions, points, saveStreak]);

  function addTransaction(tx) {
    const newTx = { ...tx, id: Date.now(), date: new Date().toISOString() };
    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.mode === "Cash") setCashBalance((b) => Math.round(b + newTx.amount));
    else if (newTx.mode === "Bank" || newTx.mode === "Card") setBankBalance((b) => Math.round(b + newTx.amount));
    else if (newTx.mode === "Internal") {
      if (newTx.amount < 0) {
        const w = Math.abs(newTx.amount);
        setBankBalance((b) => Math.round(b - w));
        setCashBalance((c) => Math.round(c + w));
      } else setBankBalance((b) => Math.round(b + newTx.amount));
    }

    if (newTx.category && ["Groceries", "Food", "Transport", "Dining", "Utilities", "Medical"].includes(newTx.category)) {
      changePoints(5);
    }
  }

  function scanReceiptSimulate() {
    const merchant = prompt("Simulated OCR: Enter merchant name", "Corner Store");
    if (merchant === null) return;
    const amountStr = prompt("Simulated OCR: Enter total amount (numbers only)", "250");
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (Number.isNaN(amount)) {
      alert("Invalid amount");
      return;
    }
    const defaultCategory = "Groceries";
    const category = prompt("Select category (Food, Travel, Grocery, Medical, Utilities, Other)", defaultCategory) || defaultCategory;
    const text = `Scanned Receipt - ${merchant} - ₹${amount} - ${category}`;
    setScannedText(text);
    handleReceiptUpload({ merchant, amount, scannedText: text, category, mode: "Unknown" });
  }

  function handleFileInputUpload(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const filename = fileList[0].name;
    const merchant = prompt(`Upload: Detected file ${filename}. Enter merchant name`, "Uploaded Merchant");
    if (merchant === null) return;
    const amountStr = prompt("Upload: Enter receipt amount (numbers only)", "250");
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (Number.isNaN(amount)) {
      alert("Invalid amount");
      return;
    }
    const defaultCategory = "Groceries";
    const category = prompt("Select category (Food, Travel, Grocery, Medical, Utilities, Other)", defaultCategory) || defaultCategory;
    const scanned = `Uploaded ${filename} • ${merchant} • ₹${amount} • ${category}`;
    setUploadedReceipts((prev) => [{ id: Date.now(), merchant, amount, mode: "Unknown", scannedText: scanned, category, vaulted: false }, ...prev]);
    handleReceiptUpload({ merchant, amount, scannedText: scanned, category, mode: "Unknown" });
  }

  function handleReceiptUpload({ merchant, amount, mode = "Unknown", scannedText = "", category = "Other" }) {
    const match = transactions.find((t) => t.amount < 0 && Math.abs(t.amount) === Math.abs(amount) && (t.mode === "Bank" || t.mode === "Card"));

    if (match) {
      const userSaysBank = window.confirm(
        `Found a bank/card transaction of ₹${Math.abs(match.amount)} for ${match.merchant} on ${formatDate(match.date)}. Was this paid via bank/card? (OK = Yes, Cancel = No)`
      );
      if (userSaysBank) {
        setUploadedReceipts((prev) => [{ id: Date.now(), merchant, amount, mode: match.mode, scannedText, category, vaulted: false }, ...prev]);
        setMessages((m) => [...m, { from: "assistant", text: `Receipt recorded and matched to existing ${match.mode} transaction — no additional deduction.` }]);
        changePoints(10);
        return;
      } else {
        const tx = { merchant, category, amount: -Math.abs(amount), mode: "Cash" };
        addTransaction(tx);
        setUploadedReceipts((prev) => [{ id: Date.now(), merchant, amount, mode: "Cash", scannedText, category, vaulted: false }, ...prev]);
        setMessages((m) => [...m, { from: "assistant", text: `Receipt recorded and debited from hand cash.` }]);
        changePoints(5);
        return;
      }
    }

    const paidByBank = window.confirm(`No matching bank transaction found for ₹${amount}. Was this paid via bank/card? (OK=Bank/Card, Cancel=Cash)`);
    const chosenMode = paidByBank ? "Card" : "Cash";
    const tx = { merchant, category, amount: -Math.abs(amount), mode: chosenMode };
    addTransaction(tx);
    setUploadedReceipts((prev) => [{ id: Date.now(), merchant, amount, mode: chosenMode, scannedText, category, vaulted: false }, ...prev]);
    setMessages((m) => [...m, { from: "assistant", text: `Receipt recorded and debited from ${chosenMode === "Cash" ? "hand cash" : "bank/card"}.` }]);
    changePoints(5);
  }

  function runEmiSimulator(emiAmount, months = 12) {
    const monthlyDisposable = Math.max(0, totalIncome - totalExpenses - emiAmount);
    const bankAfter = bankBalance - emiAmount;
    const note = `With EMI ${formatCurrency(emiAmount)}/mo, monthly disposable ≈ ${formatCurrency(monthlyDisposable)}. Bank balance would be ${formatCurrency(bankAfter)} after 1 payment.`;
    setEmiResult({ emiAmount, months, monthlyDisposable, bankAfter, cashAfter: cashBalance, note });
  }

  function addEmiToSchedule(label, amount, daysUntilDue = 30) {
    setEmiSchedule((prev) => [{ id: Date.now(), merchant: label, amount: Number(amount), nextDueDays: Number(daysUntilDue) }, ...prev]);
  }

  function totalMonthlyEmi() {
    return emiSchedule.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }

  function changePoints(delta) {
    setPoints((p) => {
      const next = Math.max(0, p + delta);
      if (next >= 500) setLevel("Finance Guru");
      else if (next >= 200) setLevel("Money Monk");
      else setLevel("Budget Rookie");
      return next;
    });
  }

  function updateGamification() {
    if (saveStreak >= 4 && !badges.includes("Saving Streak")) setBadges((b) => [...b, "Saving Streak"]);
    const lastWeekSpend = weeklySeries[weeklySeries.length - 1] ? weeklySeries[weeklySeries.length - 1].spend : 0;
    if (lastWeekSpend < 100 && !badges.includes("Low-Spend Week")) setBadges((b) => [...b, "Low-Spend Week"]);
  }

  function setPin() {
    const pin = prompt("Set a 4-digit PIN for your Vault (demo only)");
    if (!pin || pin.length < 4) {
      alert("PIN must be 4 digits");
      return;
    }
    setVaultPin(pin);
    alert("Vault PIN set (demo).");
  }

  function vaultReceipt(receiptId) {
    const receipt = uploadedReceipts.find((r) => r.id === receiptId);
    if (!receipt) return;
    setVaultReceipts((prev) => [{ id: receipt.id, hint: `${receipt.merchant} • ₹${receipt.amount}`, encrypted: true }, ...prev]);
    setUploadedReceipts((prev) => prev.map((r) => (r.id === receiptId ? { ...r, vaulted: true } : r)));
    alert("Receipt moved to Vault. Access requires PIN.");
  }

  function viewVault() {
    if (!vaultPin) return alert("No Vault PIN set. Please set PIN first.");
    const pin = prompt("Enter your Vault PIN (demo)");
    if (pin === vaultPin) {
      alert("Vault opened (demo). Items: " + vaultReceipts.map((v) => v.hint).join(", "));
    } else {
      alert("Incorrect PIN");
    }
  }

  function computeDonationSuggestion() {
    const surplus = Math.max(0, totalIncome - totalExpenses - totalMonthlyEmi());
    if (surplus <= 0) {
      setDonationSuggestion(null);
      return;
    }
    const percent = surplus < 3000 ? 2 : surplus < 10000 ? 3 : 5;
    const suggested = Math.round((percent / 100) * surplus);
    setDonationSuggestion({ percent, suggested, surplus });
  }

  function donate(amount, from = "Bank") {
    const val = Number(amount || 0);
    if (val <= 0) return alert("Invalid donation amount");
    if (from === "Bank") setBankBalance((b) => Math.round(b - val));
    else setCashBalance((c) => Math.round(c - val));
    setMessages((m) => [...m, { from: "assistant", text: `Thank you — donated ${formatCurrency(val)} from ${from}.` }]);
    changePoints(20);
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    const u = { from: "user", text: chatInput };
    setMessages((m) => [...m, u]);
    setChatInput("");

    const q = chatInput.toLowerCase();
    let reply = "I can help with receipts, gamification, vault, donations, EMI, and budgets.";
    if (q.includes("emi")) reply = emiInput > 0 ? `EMI Simulator: an EMI of ${formatCurrency(emiInput)}/month reduces disposable by ${formatCurrency(emiInput)}.` : "Enter an EMI amount to simulate.";
    else if (q.includes("donate")) reply = donationSuggestion ? `We suggest donating ${formatCurrency(donationSuggestion.suggested)} (${donationSuggestion.percent}% of surplus).` : "No donation suggested right now.";
    else if (q.includes("points") || q.includes("badge") || q.includes("level")) reply = `Points: ${points}. Level: ${level}. Badges: ${badges.join(", ")}`;
    else reply = `Summary: Bank ${formatCurrency(bankBalance)}, Cash ${formatCurrency(cashBalance)}, Total ${formatCurrency(totalBalance)}.`;

    setMessages((m) => [...m, { from: "assistant", text: reply }]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">ReceiptAI Pro — Demo</h1>
            <p className="text-sm text-gray-500 mt-1">Scan/upload receipts, EMI simulator, gamification, vault and donation suggestions.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">Bank Balance</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(bankBalance)}</div>
              <div className="text-xs text-gray-500 mt-1">Hand Cash</div>
              <div className="text-xl font-bold text-yellow-600">{formatCurrency(cashBalance)}</div>
              <div className="text-xs text-gray-400 mt-1">Total {formatCurrency(totalBalance)}</div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={scanReceiptSimulate} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">Scan Receipt (Sim)</button>
              <label className="px-4 py-2 rounded-2xl border bg-white text-indigo-700 cursor-pointer inline-block text-center">
                Upload Receipt
                <input type="file" accept="image/*,application/pdf" onChange={handleFileInputUpload} className="hidden" />
              </label>
              <button onClick={() => { const amt = Number(prompt("Simulate income amount", "2000") || 0); if (amt > 0) addTransaction({ merchant: "Sim Income", category: "Income", amount: amt, mode: "Bank" }); }} className="px-4 py-2 rounded-2xl border bg-white text-indigo-700">Simulate Income</button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <section className="col-span-4 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <div className="text-sm text-gray-500">Bank: <span className="text-green-700 font-semibold">{formatCurrency(bankBalance)}</span> • Cash: <span className="text-yellow-600 font-semibold">{formatCurrency(cashBalance)}</span></div>
            </div>

            <div className="h-48 overflow-auto border rounded-lg p-2">
              <ul className="space-y-2">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium">{tx.merchant} <span className="text-xs text-gray-400">• {tx.category}</span></div>
                      <div className="text-xs text-gray-500">{formatDate(tx.date)} • {tx.mode}</div>
                    </div>
                    <div className="text-right">
                      <div className={`${tx.amount >= 0 ? "text-green-600" : "text-red-500"} font-semibold`}>{tx.amount >= 0 ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Scanned / Uploaded Receipts</h3>
              <div className="h-36 overflow-auto border rounded-lg p-2 text-sm">
                {scannedText ? <div className="mb-2">{scannedText}</div> : null}
                {uploadedReceipts.length === 0 ? <div className="text-gray-400">No uploaded receipts yet.</div> : (
                  <ul className="space-y-1">
                    {uploadedReceipts.map((r) => (
                      <li key={r.id} className="border-b pb-1 flex justify-between items-center">
                        <div>{r.scannedText} • Mode: {r.mode} • Category: {r.category}</div>
                        <div className="flex gap-2">
                          {!r.vaulted && <button onClick={() => vaultReceipt(r.id)} className="text-xs px-2 py-1 border rounded">Move to Vault</button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="border-t pt-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ask the AI</h3>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask: emi / budget / donate / points" className="flex-1 rounded-lg border px-3 py-2" />
                <button onClick={sendChat} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Ask</button>
              </div>

              <div className="h-28 overflow-auto rounded-lg bg-white p-3 border mt-3 text-sm">
                {messages.map((m, i) => (
                  <div key={i} className={`mb-2 ${m.from === "assistant" ? "text-gray-700" : "text-indigo-700"}`}>
                    <div className={`inline-block rounded-md p-2 ${m.from === "assistant" ? "bg-gray-100" : "bg-indigo-50"}`}>
                      <pre className="whitespace-pre-wrap text-sm">{m.text}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Middle */}
          <section className="col-span-5 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Unified Expense Dashboard</h2>
              <div className="text-sm text-gray-500">Trends: <strong className="text-indigo-600">Spending +14% this month (sim)</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-1 bg-gray-50 rounded-xl p-3 shadow-inner">
                <h4 className="text-sm font-medium mb-2">Spending by Category</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={spendByCategory} dataKey="value" nameKey="name" outerRadius={60} innerRadius={30}>
                        {spendByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-1 bg-gray-50 rounded-xl p-3 shadow-inner">
                <h4 className="text-sm font-medium mb-2">Spending Timeline (Weekly)</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={weeklySeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="spend" stroke="#4F46E5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-2 bg-white rounded-xl p-3 shadow-md">
                <h4 className="text-sm font-medium mb-2">Predictive Insights & Auto-Budget</h4>
                <div className="text-sm text-gray-700">{predictiveNarrative(weeklySeries)}</div>

                <div className="mt-3 text-xs text-gray-600">
                  <strong>Auto-Budget (next month suggestion):</strong>
                  <ul className="list-disc list-inside mt-2">
                    {autoBudget.length === 0 ? <li>No suggestions yet.</li> : autoBudget.slice(0, 5).map((b, i) => <li key={i}>{b.category}: {formatCurrency(b.suggested)}</li>)}
                  </ul>
                </div>

                <div className="mt-4 bg-gray-50 rounded p-3">
                  <h4 className="text-sm font-medium">Upcoming EMIs</h4>
                  <div className="text-xs text-gray-600 mt-2">Total monthly EMI: {formatCurrency(totalMonthlyEmi())}</div>
                  <ul className="mt-2 text-sm">{emiSchedule.map((e) => <li key={e.id}>{e.merchant} • {formatCurrency(e.amount)} • due in {e.nextDueDays} days</li>)}</ul>

                  <div className="mt-3 flex gap-2">
                    <input type="number" placeholder="EMI ₹" value={emiInput} onChange={(e) => setEmiInput(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-sm" />
                    <button onClick={() => { runEmiSimulator(emiInput, 12); if (emiInput > 0) addEmiToSchedule("Custom EMI", emiInput, 30); }} className="rounded-lg bg-indigo-600 text-white px-3 py-2">Simulate & Add</button>
                  </div>

                  {emiResult && <div className="mt-3 text-sm text-gray-700">{emiResult.note}</div>}
                </div>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="col-span-3 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold">Financial Gamification</h3>
              <div className="text-xs text-gray-500 mt-1">Points, badges and levels for healthy habits.</div>
              <div className="mt-3">
                <div className="text-sm">Points: <strong>{points}</strong></div>
                <div className="text-sm">Level: <strong>{level}</strong></div>
                <div className="text-sm">Badges: <strong>{badges.join(", ")}</strong></div>
                <div className="text-xs text-gray-500 mt-2">Save streak: {saveStreak} weeks</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Secure Vault (demo)</h3>
              <div className="text-xs text-gray-500 mt-1">Move sensitive receipts to Vault (PIN-protected - demo)</div>
              <div className="mt-2 flex gap-2">
                <button onClick={setPin} className="flex-1 rounded-lg border px-3 py-2 text-sm">Set Vault PIN</button>
                <button onClick={viewVault} className="flex-1 rounded-lg border px-3 py-2 text-sm">Open Vault</button>
              </div>
              <div className="text-xs text-gray-500 mt-2">Vault items: {vaultReceipts.length}</div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Donation Insight</h3>
              <div className="text-xs text-gray-500 mt-1">Suggested donation based on monthly surplus</div>
              <div className="mt-2 text-sm">
                {donationSuggestion ? (
                  <>
                    <div>Surplus: {formatCurrency(donationSuggestion.surplus)}</div>
                    <div>Suggested: {formatCurrency(donationSuggestion.suggested)} ({donationSuggestion.percent}%)</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => donate(donationSuggestion.suggested, "Bank")} className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm">Donate {formatCurrency(donationSuggestion.suggested)}</button>
                      <button onClick={() => donate(Math.round(donationSuggestion.suggested / 2), "Bank")} className="rounded-lg border px-3 py-2 text-sm">Donate half</button>
                    </div>
                  </>
                ) : <div className="text-gray-500">No donation suggested.</div>}
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-center text-xs text-gray-400">Demo UI — simulated logic only. Replace prompt/confirm flows with real forms and secure vault encryption in production.</footer>
      </div>
    </div>
  );
}

/* Utility functions */
function formatCurrency(v) { return `₹${Math.round(v)}`; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function formatDate(iso) { const d = new Date(iso); return d.toLocaleDateString(); }
function aggregateByCategory(transactions) {
  const map = {};
  transactions.forEach((t) => {
    const cat = t.category || "Others";
    if (!map[cat]) map[cat] = 0;
    map[cat] += t.amount < 0 ? Math.abs(t.amount) : 0;
  });
  return Object.keys(map).map((k) => ({ name: k, value: Math.round(map[k]) })).sort((a, b) => b.value - a.value);
}
function makeWeeklySeries(transactions) {
  const msWeek = 7 * 24 * 3600 * 1000;
  const now = Date.now();
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now - i * msWeek);
    const label = `W-${6 - i}`;
    const weekSpend = transactions.reduce((s, t) => {
      const tms = new Date(t.date).getTime();
      if (tms >= start.getTime() && tms < start.getTime() + msWeek) return s + (t.amount < 0 ? Math.abs(t.amount) : 0);
      return s;
    }, 0);
    weeks.push({ week: label, spend: Math.round(weekSpend) });
  }
  return weeks;
}
function predictiveNarrative(series) {
  const avg = Math.round(series.reduce((s, x) => s + x.spend, 0) / series.length);
  const next = Math.round(avg * 1.05);
  return `Based on past ${series.length} weeks, average weekly spend is ${formatCurrency(avg)}. Forecast next month (4 weeks) ≈ ${formatCurrency(next * 4)}.`;
}
function computeAutoBudget(income, txns) {
  const months = 1;
  const catAgg = {};
  txns.forEach((t) => {
    const cat = t.category || "Others";
    if (!catAgg[cat]) catAgg[cat] = 0;
    if (t.amount < 0) catAgg[cat] += Math.abs(t.amount);
  });
  const items = Object.keys(catAgg).map((k) => ({ category: k, avgMonthly: Math.round(catAgg[k] / months) }));
  const totalAvg = items.reduce((s, i) => s + i.avgMonthly, 0) || 1;
  const cap = Math.round((income || 0) * 0.9);
  return items.map((i) => ({ category: i.category, suggested: Math.round((i.avgMonthly / totalAvg) * cap) })).sort((a, b) => b.suggested - a.suggested);
}
function totalMonthlyEmi() { /* used inside JSX earlier but ensured via closure */ return 0; }
