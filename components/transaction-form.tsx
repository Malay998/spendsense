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
    <button className="btn btn-primary" type="submit">Save transaction</button>
  </form>;
}
