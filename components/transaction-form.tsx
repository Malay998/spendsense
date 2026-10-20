import { addTransaction } from "@/app/actions";

export function TransactionForm() {
  return <form action={addTransaction} style={{display:"grid",gap:14}}>
    <label className="field">Description<input name="title" className="input" placeholder="e.g. Lunch at canteen" required maxLength={100}/></label>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <label className="field">Amount (₹)<input name="amount" className="input" type="number" min="1" step="0.01" placeholder="250" required/></label>
      <label className="field">Type<select name="type" className="input" defaultValue="expense"><option value="expense">Expense</option><option value="income">Income</option></select></label>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <label className="field">Category<select name="category" className="input" defaultValue="Food"><option>Food</option><option>Transport</option><option>Education</option><option>Shopping</option><option>Entertainment</option><option>Health</option><option>Rent</option><option>Subscriptions</option><option>Income</option><option>Other</option></select></label>
      <label className="field">Date<input name="date" type="date" className="input" defaultValue={new Date().toISOString().slice(0,10)} required/></label>
    </div>
    <label className="field">Purchase rating<select name="rating" className="input" defaultValue=""><option value="">Not rated</option><option value="1">1 / 5 · Not worth it</option><option value="2">2 / 5 · Could be better</option><option value="3">3 / 5 · It was okay</option><option value="4">4 / 5 · Worth it</option><option value="5">5 / 5 · Absolutely worth it</option></select></label>
    <label className="field">Note (optional)<textarea name="note" className="input" rows={2} maxLength={500} placeholder="A little context for future-you…"/></label>
    <button className="btn btn-primary" type="submit">Save transaction</button>
  </form>;
}
