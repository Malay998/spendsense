
"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  CalendarRange,
} from "lucide-react";

type Tx = {
  id: string;
  title: string;
  amount: number | string;
  type: "income" | "expense";
  category: string;
  transaction_date: string;
  currency?: string;
  created_at?: string;
  note?: string | null;
  rating?: number | null;
};

type Sub = {
  name: string;
  amount: number | string;
  billing_cycle: string;
  category: string;
  next_renewal: string | null;
  active: boolean;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);

const dateFmt = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]!
  );

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReportTools({
  transactions,
  subscriptions,
  displayName,
}: {
  transactions: Tx[];
  subscriptions: Sub[];
  displayName: string;
}) {
  const [period, setPeriod] = useState("month");
  const [start, setStart] = useState(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const rows = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    let from = "0000-01-01";
    let to = today;

    if (period === "today") {
      from = to = today;
    } else if (period === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      from = d.toISOString().slice(0, 10);
    } else if (period === "month") {
      from = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01`;
    } else if (period === "year") {
      from = `${now.getFullYear()}-01-01`;
    } else if (period === "custom") {
      from = start;
      to = end;
    }

    return transactions
      .filter(
        (t) =>
          t.transaction_date >= from &&
          t.transaction_date <= to
      )
      .sort((a, b) =>
        b.transaction_date.localeCompare(a.transaction_date)
      );
  }, [transactions, period, start, end]);

  const income = rows
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = rows
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const net = income - expense;
  const rate = income ? (net / income) * 100 : 0;

  const categories = Object.entries(
    rows
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((a, t) => {
        const category = t.category || "Other";

        a[category] =
          (a[category] || 0) + Number(t.amount);

        return a;
      }, {})
  ).sort((a, b) => b[1] - a[1]);

  const label =
    period === "today"
      ? "Today"
      : period === "week"
      ? "Last 7 days"
      : period === "month"
      ? "This month"
      : period === "year"
      ? "This year"
      : period === "all"
      ? "All time"
      : `${start} to ${end}`;

  // Export the selected transactions as a CSV file.
  function csv() {
    const lines = [
      [
        "Date",
        "Type",
        "Description",
        "Category",
        "Amount INR",
        "Purchase rating (1-5)",
        "Note",
      ],
      ...rows.map((t) => [
        t.transaction_date,
        t.type,
        t.title,
        t.category,
        Number(t.amount),
        t.rating || "",
        t.note || "",
      ]),
    ];

    const content =
      "\ufeff" +
      lines
        .map((r) =>
          r
            .map(
              (v) =>
                '"' +
                String(v ?? "").replace(/"/g, '""') +
                '"'
            )
            .join(",")
        )
        .join("\r\n");

    download(
      `spendsense-${period}-transactions.csv`,
      content,
      "text/csv;charset=utf-8"
    );
  }

  // Open a print-ready financial report that can be saved as PDF.
  function pdf() {
    const cat = categories
      .map(
        ([name, amount]) =>
          `<tr>
            <td>${esc(name)}</td>
            <td class="num">${esc(fmt(amount))}</td>
          </tr>`
      )
      .join("");

    const tx = rows
      .map(
        (t) =>
          `<tr>
            <td>${esc(dateFmt(t.transaction_date))}</td>
            <td>${esc(t.title)}</td>
            <td>${esc(t.category)}</td>
            <td>${esc(t.type)}</td>
            <td class="num">${esc(fmt(Number(t.amount)))}</td>
            <td>${t.rating ? "★".repeat(t.rating) : "—"}</td>
            <td>${esc(t.note || "")}</td>
          </tr>`
      )
      .join("");

    const recurring = subscriptions
      .filter((s) => s.active)
      .map(
        (s) =>
          `<tr>
            <td>${esc(s.name)}</td>
            <td>${esc(s.billing_cycle)}</td>
            <td class="num">${esc(fmt(Number(s.amount)))}</td>
          </tr>`
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>SpendSense financial report</title>
          <style>
            * { box-sizing: border-box; }

            body {
              font: 12px Arial, sans-serif;
              color: #17201f;
              margin: 28px;
            }

            .brand {
              font-size: 10px;
              letter-spacing: 2px;
              color: #287c5b;
              font-weight: bold;
            }

            h1 {
              font-size: 28px;
              margin: 8px 0;
            }

            p {
              color: #59655f;
              line-height: 1.5;
            }

            .muted {
              font-size: 10px;
              color: #78817d;
            }

            .metrics {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin: 24px 0;
            }

            .metric {
              border: 1px solid #dbe5df;
              border-radius: 10px;
              padding: 13px;
            }

            .metric small {
              display: block;
              color: #6b7771;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .metric strong {
              display: block;
              font-size: 18px;
              margin-top: 8px;
            }

            h2 {
              font-size: 15px;
              margin: 25px 0 10px;
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }

            th, td {
              padding: 8px 7px;
              border-bottom: 1px solid #e5ebe7;
              text-align: left;
              font-size: 10px;
            }

            th {
              background: #f1f5f2;
              color: #5c6a62;
              font-size: 9px;
              text-transform: uppercase;
            }

            .num {
              text-align: right;
              white-space: nowrap;
            }

            .columns {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 22px;
            }

            .footer {
              border-top: 1px solid #ddd;
              margin-top: 26px;
              padding-top: 10px;
              color: #7a817d;
              font-size: 9px;
            }

            @page {
              margin: 12mm;
            }

            @media print {
              body { margin: 0; }
              .metric, tr { break-inside: avoid; }
            }
          </style>
        </head>

        <body>
          <div class="brand">SPENDSENSE · PERSONAL FINANCE</div>

          <h1>Financial report</h1>

          <p>${esc(displayName || "Your account")} · ${esc(label)}</p>

          <div class="muted">
            Generated ${esc(new Date().toLocaleString("en-IN"))}
            · Based on saved transactions
          </div>

          <div class="metrics">
            <div class="metric">
              <small>Income</small>
              <strong>${esc(fmt(income))}</strong>
            </div>

            <div class="metric">
              <small>Expenses</small>
              <strong>${esc(fmt(expense))}</strong>
            </div>

            <div class="metric">
              <small>Net cash flow</small>
              <strong>${esc(fmt(net))}</strong>
            </div>

            <div class="metric">
              <small>Savings rate</small>
              <strong>${income ? rate.toFixed(1) + "%" : "—"}</strong>
            </div>
          </div>

          <div class="columns">
            <section>
              <h2>Spending by category</h2>

              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="num">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  ${
                    cat ||
                    '<tr><td colspan="2">No expenses in this period.</td></tr>'
                  }
                </tbody>
              </table>

              <h2>Active recurring payments</h2>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Cycle</th>
                    <th class="num">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  ${
                    recurring ||
                    '<tr><td colspan="3">No active subscriptions recorded.</td></tr>'
                  }
                </tbody>
              </table>
            </section>

            <section>
              <h2>Transaction history (${rows.length})</h2>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th class="num">Amount</th>
                    <th>Rating</th>
                    <th>Note</th>
                  </tr>
                </thead>

                <tbody>
                  ${
                    tx ||
                    '<tr><td colspan="7">No transactions in this period.</td></tr>'
                  }
                </tbody>
              </table>
            </section>
          </div>

          <div class="footer">
            SpendSense report · Only recorded data is included.
            This report is for personal tracking and is not financial advice.
          </div>

          <script>
            window.onload = () => setTimeout(() => window.print(), 300);
          <\/script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");

    if (!w) {
      alert("Please allow pop-ups to create the PDF report.");
      return;
    }

    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <>
      <div className="report-controls panel-soft">
        <div className="report-period">
          <CalendarRange size={17} />

          <div>
            <b>Report period</b>
            <small>Choose the dates to include in your exports.</small>
          </div>
        </div>

        <div className="report-control-fields">
          <label className="field">
            Period

            <select
              className="input"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
              <option value="custom">Custom dates</option>
            </select>
          </label>

          {period === "custom" && (
            <>
              <label className="field">
                From

                <input
                  className="input"
                  type="date"
                  value={start}
                  max={end}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>

              <label className="field">
                To

                <input
                  className="input"
                  type="date"
                  value={end}
                  min={start}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </>
          )}
        </div>
      </div>

      <div className="grid-4 report-metrics">
        <div className="panel metric">
          <span className="metric-label">Income</span>
          <div className="metric-value positive">{fmt(income)}</div>
          <small className="muted">Selected period</small>
        </div>

        <div className="panel metric">
          <span className="metric-label">Expenses</span>
          <div className="metric-value negative">{fmt(expense)}</div>
          <small className="muted">Selected period</small>
        </div>

        <div className="panel metric">
          <span className="metric-label">Net cash flow</span>
          <div
            className={`metric-value ${
              net >= 0 ? "positive" : "negative"
            }`}
          >
            {fmt(net)}
          </div>
          <small className="muted">Income minus expenses</small>
        </div>

        <div className="panel metric">
          <span className="metric-label">Savings rate</span>
          <div className="metric-value">
            {income ? `${rate.toFixed(1)}%` : "—"}
          </div>
          <small className="muted">Based on recorded income</small>
        </div>
      </div>

      <div className="report-actions">
        <button className="btn btn-primary" onClick={pdf}>
          <FileText size={16} />
          Download PDF
          <Printer size={14} />
        </button>

        <button className="btn" onClick={csv}>
          <FileSpreadsheet size={16} />
          Export CSV
          <Download size={14} />
        </button>
      </div>

      <div className="grid-2 report-lower">
        <section className="panel">
          <div className="section-head">
            <div>
              <div className="eyebrow">CATEGORY BREAKDOWN</div>
              <h2 className="section-title" style={{ marginTop: 7 }}>
                Where it went
              </h2>
            </div>

            <span className="pill">
              {categories.length} categories
            </span>
          </div>

          {categories.length ? (
            categories.map(([name, amount], i) => (
              <div className="report-category" key={name}>
                <div>
                  <span>{name}</span>
                  <b>{fmt(amount)}</b>
                </div>

                <div className="report-bar">
                  <i
                    style={{
                      width: `${
                        expense
                          ? Math.max(2, (amount / expense) * 100)
                          : 0
                      }%`,
                      animationDelay: `${i * 45}ms`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No expense categories for this period yet.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <div className="eyebrow">TRANSACTION LEDGER</div>
              <h2 className="section-title" style={{ marginTop: 7 }}>
                Included in this report
              </h2>
            </div>

            <span className="pill">{rows.length} records</span>
          </div>

          <div className="report-ledger">
            {rows.slice(0, 8).map((t) => (
              <div className="report-ledger-row" key={t.id}>
                <div>
                  <b>{t.title}</b>
                  <small>
                    {dateFmt(t.transaction_date)} · {t.category}
                  </small>
                </div>

                <strong
                  className={
                    t.type === "income" ? "positive" : "negative"
                  }
                >
                  {t.type === "income" ? "+" : "−"}
                  {fmt(Number(t.amount))}
                </strong>
              </div>
            ))}
          </div>

          {rows.length > 8 && (
            <p className="small muted" style={{ marginTop: 12 }}>
              PDF and CSV include all {rows.length} transactions in this
              period.
            </p>
          )}

          {!rows.length && (
            <div className="empty">No transactions in this period.</div>
          )}
        </section>
      </div>

      <p
        className="small muted"
        style={{ marginTop: 16, lineHeight: 1.7 }}
      >
        PDF opens a print-ready report in a new tab. Choose{" "}
        <b>Save as PDF</b> in your browser&apos;s print destination.
        CSV contains your transaction rows and can be opened in Excel or
        Sheets.
      </p>
    </>
  );
}
