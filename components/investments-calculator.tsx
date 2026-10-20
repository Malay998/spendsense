
"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp, ShieldCheck } from "lucide-react";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="calc-range">
      <span>
        <span>{label}</span>
        <b>
          {value}
          {suffix}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="range-ends">
        <small>
          {min}
          {suffix}
        </small>
        <small>
          {max}
          {suffix}
        </small>
      </span>
    </label>
  );
}

export default function InvestmentsCalculator() {
  const [monthly, setMonthly] = useState(3000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const [principal, setPrincipal] = useState(50000);
  const [fdRate, setFdRate] = useState(7);
  const [fdYears, setFdYears] = useState(3);
  const [compound, setCompound] = useState(4);

  const sip = useMemo(() => {
    const n = sipYears * 12;
    const r = sipRate / 100 / 12;

    return r
      ? (monthly * (Math.pow(1 + r, n) - 1) / r) * (1 + r)
      : monthly * n;
  }, [monthly, sipRate, sipYears]);

  const fd = useMemo(
    () =>
      principal *
      Math.pow(1 + fdRate / 100 / compound, compound * fdYears),
    [principal, fdRate, compound, fdYears]
  );

  const sipInvested = monthly * sipYears * 12;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">A LITTLE MATH, A CLEARER PLAN</div>
          <h1 className="page-title">
            Investment lab<span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 9 }}>
            Explore illustrative SIP and fixed-deposit growth scenarios.
          </p>
        </div>
        <span className="pill">
          <ShieldCheck size={13} /> Estimates only
        </span>
      </div>

      <div className="grid-2 investment-grid">
        <section className="panel calc-panel">
          <div className="calc-heading">
            <span className="metric-icon">
              <TrendingUp size={18} />
            </span>
            <span className="pill">01 / SIP</span>
          </div>

          <h2 className="section-title" style={{ fontSize: 23, marginTop: 18 }}>
            Let consistency compound.
          </h2>

          <p className="muted small" style={{ lineHeight: 1.7, marginTop: 8 }}>
            Estimate a future value from regular monthly investments. Returns
            are hypothetical, not guaranteed.
          </p>

          <label className="field" style={{ marginTop: 22 }}>
            Monthly investment (₹)
            <input
              className="input"
              type="number"
              min="0"
              max="100000000"
              value={monthly}
              onChange={(e) =>
                setMonthly(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>

          <Range
            label="Expected annual return"
            value={sipRate}
            min={1}
            max={20}
            onChange={setSipRate}
            suffix="%"
          />

          <Range
            label="Investment duration"
            value={sipYears}
            min={1}
            max={40}
            onChange={setSipYears}
            suffix=" yrs"
          />

          <div className="calc-output">
            <small>ESTIMATED FUTURE VALUE</small>
            <strong>{money(sip)}</strong>
            <div className="calc-output-split">
              <span>
                Invested
                <b>{money(sipInvested)}</b>
              </span>
              <span>
                Illustrative growth
                <b>{money(sip - sipInvested)}</b>
              </span>
            </div>
          </div>
        </section>

        <section className="panel calc-panel">
          <div className="calc-heading">
            <span className="metric-icon">
              <Calculator size={18} />
            </span>
            <span className="pill">02 / FIXED DEPOSIT</span>
          </div>

          <h2 className="section-title" style={{ fontSize: 23, marginTop: 18 }}>
            Know your maturity.
          </h2>

          <p className="muted small" style={{ lineHeight: 1.7, marginTop: 8 }}>
            Model a one-time deposit using a selected annual rate and
            compounding frequency.
          </p>

          <label className="field" style={{ marginTop: 22 }}>
            Deposit amount (₹)
            <input
              className="input"
              type="number"
              min="0"
              max="1000000000"
              value={principal}
              onChange={(e) =>
                setPrincipal(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </label>

          <Range
            label="Annual interest rate"
            value={fdRate}
            min={1}
            max={12}
            step={0.25}
            onChange={setFdRate}
            suffix="%"
          />

          <Range
            label="Tenure"
            value={fdYears}
            min={1}
            max={10}
            onChange={setFdYears}
            suffix=" yrs"
          />

          <label className="field">
            Compounding frequency
            <select
              className="input"
              value={compound}
              onChange={(e) => setCompound(Number(e.target.value))}
            >
              <option value={1}>Annually</option>
              <option value={2}>Half-yearly</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
            </select>
          </label>

          <div className="calc-output">
            <small>ESTIMATED MATURITY VALUE</small>
            <strong>{money(fd)}</strong>
            <div className="calc-output-split">
              <span>
                Principal
                <b>{money(principal)}</b>
              </span>
              <span>
                Illustrative interest
                <b>{money(fd - principal)}</b>
              </span>
            </div>
          </div>
        </section>
      </div>

      <p className="small muted" style={{ marginTop: 17, lineHeight: 1.7 }}>
        SIP calculations assume end-of-month contributions with monthly
        compounding. FD calculations use compound interest at the selected
        frequency. Actual products may differ due to their terms, taxes, and
        fees. This is an educational calculator, not investment advice.
      </p>
    </>
  );
}
