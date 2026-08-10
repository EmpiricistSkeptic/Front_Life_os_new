import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Domain, Metric, DomainAnalytics, AnalyticsParams } from "../types";
import {
  fetchDomainDetail,
  fetchDomainAnalytics,
  createMetric,
  deleteMetric,
  createEntry,
  createGoal,
} from "../services/domains";
import { Bar, SpecificInsights } from "./DomainInsights";

type Props = { id: number; onClose: () => void; onDeleted?: () => void };

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");
const pct = (v: number) => fmt(v, 1) + "%";

function scoreColor(v: number) {
  if (v >= 70) return "#00ff88";
  if (v >= 45) return "#ffcc00";
  return "#ff3366";
}

function scoreLabel(v: number) {
  if (v >= 70) return "EXCELLENT";
  if (v >= 45) return "AVERAGE";
  return "CRITICAL";
}

// ── gauge arc ─────────────────────────────────────────────────────────────────

function GaugeArc({ value, color, size = 96 }: { value: number; color: string; size?: number }) {
  const r = size / 2 - 9;
  const cx = size / 2, cy = size / 2;
  const toR = (d: number) => (d * Math.PI) / 180;
  const start = -210, arc = 240;
  const end = start + (Math.min(value, 100) / 100) * arc;
  
  const pt = (a: number) => ({ x: cx + r * Math.cos(toR(a)), y: cy + r * Math.sin(toR(a)) });
  const s = pt(start), e0 = pt(start + arc), e1 = pt(end);
  const fillArc = (Math.min(value, 100) / 100) * arc;
  
  return (
    <svg width={size} height={size}>
      <path
        d={`M${s.x},${s.y} A${r},${r} 0 1 1 ${e0.x},${e0.y}`}
        fill="none" stroke="rgba(0,212,255,.08)" strokeWidth={6} strokeLinecap="butt"
      />
      {value > 0 && (
        <path
          d={`M${s.x},${s.y} A${r},${r} 0 ${fillArc > 180 ? 1 : 0} 1 ${e1.x},${e1.y}`}
          fill="none" stroke={color} strokeWidth={6} strokeLinecap="butt"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          strokeDasharray="4 2"
        />
      )}
    </svg>
  );
}

function Ring({ progress, size = 64 }: { progress: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const color = progress >= 1 ? "#00ff88" : progress >= 0.6 ? "#ffcc00" : "#ff3366";
  
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,212,255,.08)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="butt"
        strokeDasharray={`${Math.min(progress, 1) * circ} ${circ}`}
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray .8s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}

// ── log entry form ────────────────────────────────────────────────────────────

const TIME_METRICS = ["Bedtime", "Wake Time"];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function LogEntryForm({ metric, onLogged }: { metric: Metric; onLogged: (newVal: number) => void }) {
  const isTime = TIME_METRICS.includes(metric.name);
  const defaultTime = metric.name === "Bedtime" ? "22:00" : "07:00";
  const [val, setVal] = useState(isTime ? defaultTime : "");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    const num = isTime ? timeToMinutes(val) : parseFloat(val);
    if (!isTime && !Number.isFinite(num)) return;
    if (isTime && !val) return;
    
    setSaving(true);
    try {
      await createEntry({ metric: metric.id, value: num });
      setOk(true);
      if (!isTime) setVal("");
      onLogged(num);
      setTimeout(() => setOk(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, background: "rgba(0,212,255,.04)", border: "1px solid rgba(0,212,255,.2)",
    padding: "7px 10px", fontSize: 11, color: "#a8d4e6",
    fontFamily: "'Share Tech Mono',monospace", outline: "none", letterSpacing: 0.5,
    clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))",
    colorScheme: "dark",
  };

  return (
    <div style={{ marginTop: 10 }}>
      {isTime && (
        <div style={{ fontSize: 8, color: "rgba(0,212,255,.35)", letterSpacing: 1.5, fontFamily: "'Share Tech Mono',monospace", marginBottom: 5 }}>
          ▸ {metric.name === "Bedtime" ? "TIME YOU WENT TO BED" : "TIME YOU WOKE UP"}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {isTime ? (
          <input type="time" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={inputStyle} />
        ) : (
          <input 
            type="number" step="any"
            placeholder={metric.unit ? `VALUE (${metric.unit.toUpperCase()})` : "VALUE"}
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} style={inputStyle} 
          />
        )}
        <button onClick={submit} disabled={saving || !val} style={{
          padding: "7px 14px",
          background: ok ? "rgba(0,255,136,.1)" : "rgba(0,212,255,.08)",
          border: `1px solid ${ok ? "rgba(0,255,136,.4)" : "rgba(0,212,255,.3)"}`,
          color: ok ? "#00ff88" : "#00d4ff",
          fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1,
          cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap",
          clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
        }}>
          {ok ? "[ OK ]" : saving ? "[ ... ]" : "[ LOG ]"}
        </button>
      </div>
      {isTime && ok && (
        <div style={{ fontSize: 8, color: "#00ff88", marginTop: 4, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
          ▸ LOGGED AS {timeToMinutes(val)} MIN FROM MIDNIGHT
        </div>
      )}
    </div>
  );
}

// ── set goal form ─────────────────────────────────────────────────────────────

function SetGoalForm({ metric, onSaved }: { metric: Metric; onSaved: () => void }) {
  const [targetVal, setTargetVal] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [comparison, setComparison] = useState<"at_least" | "at_most" | "exact">("at_least");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const num = parseFloat(targetVal);
    if (!Number.isFinite(num)) { setError("[ ERROR ] INVALID VALUE"); return; }
    
    setSaving(true); setError(null);
    try {
      await createGoal({ metric: metric.id, target_value: num, period, comparison_type: comparison });
      setOk(true);
      setTimeout(() => { setOk(false); onSaved(); }, 1500);
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : "[ SYSTEM ERROR ]");
    } finally {
      setSaving(false);
    }
  };

  const periodBtns = [
    { v: "daily" as const, l: "DAILY" },
    { v: "weekly" as const, l: "WEEKLY" },
    { v: "monthly" as const, l: "MONTHLY" },
  ];
  
  const compBtns = [
    { v: "at_least" as const, l: "≥ MIN", c: "#00ff88" },
    { v: "at_most" as const, l: "≤ MAX", c: "#ffcc00" },
    { v: "exact" as const, l: "= EXACT", c: "#bf7fff" },
  ];

  const btnStyle = (active: boolean, color = "#00d4ff"): React.CSSProperties => ({
    padding: "5px 10px", fontSize: 9, letterSpacing: 1,
    fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all .15s",
    background: active ? `${color}15` : "rgba(0,212,255,.03)",
    border: `1px solid ${active ? color : "rgba(0,212,255,.15)"}`,
    color: active ? color : "rgba(0,212,255,.35)",
    boxShadow: active ? `0 0 8px ${color}40` : "none",
  });

  return (
    <div style={{ marginTop: 10, padding: "12px 14px", background: "rgba(191,127,255,.04)", border: "1px solid rgba(191,127,255,.15)", position: "relative", clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(191,127,255,.6),transparent)" }} />
      <div style={{ fontSize: 8, color: "rgba(191,127,255,.6)", letterSpacing: 2, fontFamily: "'Orbitron',sans-serif", marginBottom: 10 }}>◈ SET OBJECTIVE</div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 1, fontFamily: "'Share Tech Mono',monospace", marginBottom: 5 }}>PERIOD</div>
        <div style={{ display: "flex", gap: 5 }}>
          {periodBtns.map(b => <button key={b.v} style={btnStyle(period === b.v)} onClick={() => setPeriod(b.v)}>{b.l}</button>)}
        </div>
      </div>
      
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 1, fontFamily: "'Share Tech Mono',monospace", marginBottom: 5 }}>CONDITION</div>
        <div style={{ display: "flex", gap: 5 }}>
          {compBtns.map(b => <button key={b.v} style={btnStyle(comparison === b.v, b.c)} onClick={() => setComparison(b.v)}>{b.l}</button>)}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input 
          type="number" step="any"
          placeholder={metric.unit ? `TARGET (${metric.unit.toUpperCase()})` : "TARGET VALUE"}
          value={targetVal} onChange={e => setTargetVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ flex: 1, background: "rgba(191,127,255,.04)", border: "1px solid rgba(191,127,255,.2)", padding: "7px 10px", fontSize: 11, color: "#a8d4e6", fontFamily: "'Share Tech Mono',monospace", outline: "none", letterSpacing: 0.5, clipPath: "polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,0 100%)" }}
        />
        <button onClick={submit} disabled={saving || !targetVal} style={{
          padding: "7px 14px",
          background: ok ? "rgba(0,255,136,.1)" : "rgba(191,127,255,.1)",
          border: `1px solid ${ok ? "rgba(0,255,136,.4)" : "rgba(191,127,255,.35)"}`,
          color: ok ? "#00ff88" : "#bf7fff",
          fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1,
          cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap",
          clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
        }}>
          {ok ? "[ SAVED ]" : saving ? "[ ... ]" : "[ SET ]"}
        </button>
      </div>
      
      {error && <div style={{ fontSize: 10, color: "#ff3366", marginTop: 6, fontFamily: "'Share Tech Mono',monospace" }}>{error}</div>}
    </div>
  );
}

// ── add metric form ───────────────────────────────────────────────────────────

function AddMetricForm({ domainId, onAdded }: { domainId: number; onAdded: (m: Metric) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [agg, setAgg] = useState("avg");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError("[ ERROR ] NAME REQUIRED"); return; }
    setSaving(true); setError(null);
    try {
      const m = await createMetric({ name: name.trim(), domain: domainId, unit: unit.trim() || undefined, aggregation_type: agg });
      onAdded(m); 
      setName(""); setUnit(""); setAgg("avg"); setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : "[ SYSTEM ERROR ]");
      setSaving(false);
    }
  };

  if (!open) return (
    <button 
      onClick={() => setOpen(true)} 
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
        background: "rgba(0,212,255,.03)", border: "1px dashed rgba(0,212,255,.2)",
        color: "rgba(0,212,255,.5)", fontFamily: "'Share Tech Mono',monospace",
        fontSize: 10, letterSpacing: 1, cursor: "pointer", transition: "all .2s", width: "100%", marginTop: 14,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,.5)"; e.currentTarget.style.color = "#00d4ff"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,212,255,.2)"; e.currentTarget.style.color = "rgba(0,212,255,.5)"; }}
    >
      ＋ REGISTER NEW METRIC
    </button>
  );

  const inputStyle: React.CSSProperties = {
    background: "rgba(0,212,255,.04)", border: "1px solid rgba(0,212,255,.2)",
    padding: "8px 10px", fontSize: 11, color: "#a8d4e6",
    fontFamily: "'Share Tech Mono',monospace", outline: "none", letterSpacing: 0.5,
    clipPath: "polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,0 100%)",
  };

  return (
    <div style={{ background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.2)", padding: "16px", marginTop: 14, position: "relative", clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent)" }} />
      <div style={{ fontSize: 8, color: "rgba(0,212,255,.5)", letterSpacing: 2, fontFamily: "'Orbitron',sans-serif", marginBottom: 12 }}>◈ REGISTER METRIC</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <input placeholder="METRIC NAME *" value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
        <input placeholder="UNIT (KG, MIN...)" value={unit} onChange={e => setUnit(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
      </div>
      
      <select value={agg} onChange={e => setAgg(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: 12, appearance: "none" }}>
        <option value="avg">AVG — AVERAGE VALUE</option>
        <option value="sum">SUM — TOTAL PER PERIOD</option>
        <option value="max">MAX — MAXIMUM</option>
        <option value="min">MIN — MINIMUM</option>
        <option value="last">LAST — LATEST VALUE</option>
      </select>
      
      {error && <div style={{ fontSize: 10, color: "#ff3366", marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>{error}</div>}
      
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { setOpen(false); setError(null); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1, cursor: "pointer" }}>
          [ CANCEL ]
        </button>
        <button onClick={submit} disabled={saving} style={{ flex: 1, padding: "8px", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.3)", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1, cursor: "pointer", clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
          {saving ? "[ REGISTERING... ]" : "[ CONFIRM ]"}
        </button>
      </div>
    </div>
  );
}

// ── metric item ───────────────────────────────────────────────────────────────

function MetricItem({ metric, onDelete, onLogged }: { metric: Metric; onDelete: (id: number) => void; onLogged: (id: number, val: number) => void; }) {
  const [mode, setMode] = useState<null | "log" | "goal">(null);
  const [confirmDel, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteMetric(metric.id); onDelete(metric.id); }
    catch (e) { console.error(e); setDeleting(false); }
  };

  const val = metric.latest_value;
  const hasVal = val !== null && val !== undefined;

  return (
    <div style={{
      background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.12)",
      padding: "13px 15px", position: "relative", overflow: "hidden",
      clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
      transition: "border-color .2s",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace", marginBottom: 4 }}>
            METRIC-{String(metric.id).padStart(3, "0")}
          </div>
          <div style={{ fontSize: 11, color: "rgba(0,212,255,.7)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 0.5, marginBottom: 6 }}>
            {metric.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#00d4ff", fontFamily: "'Orbitron',sans-serif", letterSpacing: -1, textShadow: "0 0 10px rgba(0,212,255,.5)" }}>
              {hasVal ? val : "—"}
            </span>
            {metric.unit && <span style={{ fontSize: 10, color: "rgba(0,212,255,.4)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{metric.unit.toUpperCase()}</span>}
          </div>
          {metric.aggregation_type === "sum" && hasVal && (
            <div style={{ fontSize: 8, color: "rgba(0,212,255,.3)", marginTop: 3, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>▸ TODAY TOTAL</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <button onClick={() => setMode(m => m === "log" ? null : "log")} style={{
            padding: "5px 10px", fontSize: 9, letterSpacing: 1,
            background: mode === "log" ? "rgba(0,212,255,.12)" : "rgba(0,212,255,.04)",
            border: `1px solid ${mode === "log" ? "rgba(0,212,255,.5)" : "rgba(0,212,255,.2)"}`,
            color: mode === "log" ? "#00d4ff" : "rgba(0,212,255,.4)",
            fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all .15s",
          }}>LOG</button>
          
          <button onClick={() => setMode(m => m === "goal" ? null : "goal")} style={{
            padding: "5px 10px", fontSize: 9, letterSpacing: 1,
            background: mode === "goal" ? "rgba(191,127,255,.12)" : "rgba(191,127,255,.04)",
            border: `1px solid ${mode === "goal" ? "rgba(191,127,255,.5)" : "rgba(191,127,255,.15)"}`,
            color: mode === "goal" ? "#bf7fff" : "rgba(191,127,255,.35)",
            fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all .15s",
          }}>OBJ</button>
          
          {!confirmDel ? (
            <button onClick={() => setConfirm(true)} style={{
              width: 28, height: 28, background: "rgba(255,51,102,.05)",
              border: "1px solid rgba(255,51,102,.15)", color: "rgba(255,51,102,.5)",
              cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,51,102,.12)"; e.currentTarget.style.color = "#ff3366"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,51,102,.05)"; e.currentTarget.style.color = "rgba(255,51,102,.5)"; }}>
              ✕
            </button>
          ) : (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setConfirm(false)} style={{ padding: "4px 7px", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, cursor: "pointer" }}>N</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "4px 7px", background: "rgba(255,51,102,.15)", border: "1px solid rgba(255,51,102,.4)", color: "#ff3366", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, cursor: "pointer" }}>{deleting ? "..." : "Y"}</button>
            </div>
          )}
        </div>
      </div>
      
      {mode === "log" && <LogEntryForm metric={metric} onLogged={val => { onLogged(metric.id, val); setMode(null); }} />}
      {mode === "goal" && <SetGoalForm metric={metric} onSaved={() => setMode(null)} />}
    </div>
  );
}

// ── domain score hero ─────────────────────────────────────────────────────────

function DomainScoreHero({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div style={{
      background: "rgba(0,10,30,.9)", border: `1px solid ${color}30`,
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, marginBottom: 20,
      clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ position: "relative", flexShrink: 0, width: 96, height: 96 }}>
        <GaugeArc value={score} color={color} size={96} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'Orbitron',sans-serif", lineHeight: 1, textShadow: `0 0 12px ${color}` }}>{fmt(score)}</span>
          <span style={{ fontSize: 8, color: "rgba(0,212,255,.3)", letterSpacing: 1, marginTop: 3, fontFamily: "'Share Tech Mono',monospace" }}>/100</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 3, fontFamily: "'Share Tech Mono',monospace", marginBottom: 6 }}>▸ DOMAIN POWER LEVEL</div>
        <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: 2, marginBottom: 6, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 20px ${color}` }}>{scoreLabel(score)}</div>
        <div style={{ fontSize: 10, color: "rgba(168,212,230,.4)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 0.5 }}>COMPOSITE SCORE ACROSS ALL METRICS</div>
      </div>
    </div>
  );
}

// ── summary grid ──────────────────────────────────────────────────────────────

const SUMMARY_META: Record<string, { label: string; icon: string }> = {
  intensity:      { label: "INTENSITY",   icon: "⚡" },
  consistency:    { label: "CONSISTENCY", icon: "◈" },
  stability:      { label: "STABILITY",   icon: "△" },
  growth:         { label: "GROWTH",      icon: "◉" },
  goal_alignment: { label: "OBJECTIVES",  icon: "✦" },
};

function SummaryGrid({ data }: { data: Record<string, number> }) {
  const domainScore = data.domain_score;
  const keys = Object.keys(data).filter(k => k !== "domain_score");
  
  return (
    <>
      {domainScore !== undefined && <DomainScoreHero score={domainScore} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
        {keys.map(k => {
          const val = data[k];
          if (val === null || val === undefined) return null;
          const meta = SUMMARY_META[k] ?? { label: k.toUpperCase(), icon: "◇" };
          const color = scoreColor(val);
          
          return (
            <div key={k} style={{
              background: "rgba(0,10,30,.9)", border: `1px solid ${color}25`,
              padding: "13px 15px", position: "relative", overflow: "hidden",
              transition: "all .2s", cursor: "default",
              clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}60`; e.currentTarget.style.boxShadow = `0 0 16px ${color}20`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
              <div style={{ fontSize: 14, marginBottom: 6, filter: `drop-shadow(0 0 4px ${color})` }}>{meta.icon}</div>
              <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>{meta.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1, textShadow: `0 0 8px ${color}` }}>
                {fmt(val)}
                <span style={{ fontSize: 10, color: "rgba(0,212,255,.3)", marginLeft: 2 }}>%</span>
              </div>
              <Bar value={val} color={color} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── goal card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: any }) {
  const { progress, current_value, target, comparison, goal_id } = goal;
  const pctNum = Math.round(progress * 100);
  const color = progress >= 1 ? "#00ff88" : progress >= 0.6 ? "#ffcc00" : "#ff3366";
  const compLabel: Record<string, string> = { at_least: "≥ MIN", at_most: "≤ MAX", exact: "= EXACT" };
  
  return (
    <div style={{
      background: "rgba(0,10,30,.9)", border: `1px solid ${color}25`,
      padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, marginTop: 12,
      clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)",
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}60,transparent)` }} />
      <div style={{ position: "relative", flexShrink: 0, width: 56, height: 56 }}>
        <Ring progress={progress} size={56} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, fontFamily: "'Orbitron',sans-serif" }}>
          {pctNum}%
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 2, marginBottom: 5, fontFamily: "'Share Tech Mono',monospace" }}>OBJ-{String(goal_id).padStart(3, "0")}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e8f4ff", marginBottom: 8, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 0.5 }}>
          {current_value} <span style={{ color: "rgba(0,212,255,.4)" }}>/ {compLabel[comparison] ?? comparison}</span> {target}
        </div>
        <div style={{ height: 3, background: "rgba(0,212,255,.08)", position: "relative" }}>
          <div style={{ height: "100%", width: `${Math.min(pctNum, 100)}%`, background: color, boxShadow: `0 0 6px ${color}`, transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
          {[25, 50, 75].map(t => <div key={t} style={{ position: "absolute", top: 0, bottom: 0, left: `${t}%`, width: 1, background: "rgba(0,212,255,.15)" }} />)}
        </div>
        {progress >= 1 && <div style={{ fontSize: 9, color: "#00ff88", marginTop: 6, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1 }}>▸ OBJECTIVE COMPLETE</div>}
      </div>
    </div>
  );
}

// ── metric analytics card ─────────────────────────────────────────────────────

const SCORE_KEYS = [
  { k: "metric_score",    label: "TOTAL",  icon: "⭐" },
  { k: "intensity_score", label: "INTENS", icon: "⚡" },
  { k: "stability_score", label: "STABLE", icon: "△" },
  { k: "growth_score",    label: "GROWTH", icon: "◉" },
];
const STAT_KEYS = [
  { k: "window_sum",      label: "PERIOD",  ratio: false, growth: false },
  { k: "monthly_sum",     label: "MONTH",   ratio: false, growth: false },
  { k: "monthly_avg",     label: "AVG/DAY", ratio: false, growth: false },
  { k: "std",             label: "STD DEV", ratio: false, growth: false },
  { k: "consistency",     label: "CONSIST", ratio: true,  growth: false },
  { k: "growth",          label: "GROWTH",  ratio: false, growth: true  },
  { k: "completion_rate", label: "COMPLET", ratio: true,  growth: false },
  { k: "current_streak",  label: "STREAK",  ratio: false, growth: false },
  { k: "longest_streak",  label: "RECORD",  ratio: false, growth: false },
  { k: "avg_streak",      label: "AVG STK", ratio: false, growth: false },
  { k: "fail_count",      label: "FAILS",   ratio: false, growth: false },
];

function MetricAnalyticsCard({ metricKey, data }: { metricKey: string; data: Record<string, any> }) {
  const scores = SCORE_KEYS.filter(s => data[s.k] !== null && data[s.k] !== undefined);
  const stats  = STAT_KEYS.filter(s => data[s.k] !== null && data[s.k] !== undefined);
  
  return (
    <div style={{ background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.12)", marginBottom: 10, position: "relative", clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,.5),transparent)" }} />
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(0,212,255,.08)" }}>
          <div style={{ width: 6, height: 6, background: "#00d4ff", boxShadow: "0 0 6px rgba(0,212,255,.8)" }} />
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#00d4ff", letterSpacing: 1 }}>{metricKey.toUpperCase()}</span>
        </div>
        
        {scores.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${scores.length},1fr)`, gap: 8, marginBottom: 14 }}>
            {scores.map(s => {
              const val = data[s.k] as number;
              const color = scoreColor(val);
              return (
                <div key={s.k} style={{ background: `${color}08`, border: `1px solid ${color}22`, padding: "10px", textAlign: "center", clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                  <div style={{ fontSize: 12, marginBottom: 4, filter: `drop-shadow(0 0 4px ${color})` }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 8px ${color}` }}>{fmt(val)}</div>
                  <div style={{ fontSize: 7, color: "rgba(0,212,255,.4)", letterSpacing: 1.5, marginTop: 3, fontFamily: "'Share Tech Mono',monospace" }}>{s.label}</div>
                  <Bar value={val} color={color} />
                </div>
              );
            })}
          </div>
        )}
        
        {stats.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {stats.map(s => {
              const val = data[s.k] as number;
              let display = fmt(val, 2);
              let color = "rgba(0,212,255,.6)";
              if (s.ratio) display = pct(val * 100);
              if (s.growth) { color = val < 0 ? "#ff3366" : "#00ff88"; display = (val < 0 ? "" : "+") + fmt(val * 100, 1) + "%"; }
              return (
                <div key={s.k} style={{ background: "rgba(0,212,255,.03)", border: "1px solid rgba(0,212,255,.1)", padding: "4px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 7, color: "rgba(0,212,255,.35)", letterSpacing: 1.5, fontFamily: "'Share Tech Mono',monospace" }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}>{display}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {data.goal && <GoalCard goal={data.goal} />}
      </div>
    </div>
  );
}

// ── period selector ───────────────────────────────────────────────────────────

type PeriodPreset = "weekly" | "monthly" | "custom";

interface PeriodSelectorProps {
  period: AnalyticsParams["period"];
  endDate: string;
  loading: boolean;
  onApply: (period: AnalyticsParams["period"], endDate: string) => void;
}

function PeriodSelector({ period, endDate, loading, onApply }: PeriodSelectorProps) {
  // Derive local state from current applied values
  const getPresetFromPeriod = (p: string): PeriodPreset => {
    if (p === "weekly") return "weekly";
    if (p === "monthly") return "monthly";
    return "custom";
  };
  const getCustomDays = (p: string): string => {
    if (p.startsWith("days:")) return p.split(":")[1];
    return "14";
  };

  const [preset, setPreset]       = useState<PeriodPreset>(getPresetFromPeriod(period));
  const [customDays, setCustomDays] = useState(getCustomDays(period));
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [dirty, setDirty]         = useState(false);

  // Track whether local state differs from applied state
  const buildPeriod = (): AnalyticsParams["period"] => {
    if (preset === "weekly") return "weekly";
    if (preset === "monthly") return "monthly";
    const n = parseInt(customDays, 10);
    return `days:${Number.isFinite(n) && n > 0 ? n : 7}`;
  };

  const handlePreset = (p: PeriodPreset) => { setPreset(p); setDirty(true); };
  const handleDays = (v: string) => { setCustomDays(v); setDirty(true); };
  const handleEndDate = (v: string) => { setLocalEndDate(v); setDirty(true); };

  const handleApply = () => {
    onApply(buildPeriod(), localEndDate);
    setDirty(false);
  };

  const presetBtns: { v: PeriodPreset; l: string }[] = [
    { v: "weekly",  l: "7 DAYS"  },
    { v: "monthly", l: "30 DAYS" },
    { v: "custom",  l: "CUSTOM"  },
  ];

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px", fontSize: 9, letterSpacing: 1,
    fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all .15s",
    background: active ? "rgba(0,212,255,.12)" : "rgba(0,212,255,.03)",
    border: `1px solid ${active ? "rgba(0,212,255,.5)" : "rgba(0,212,255,.15)"}`,
    color: active ? "#00d4ff" : "rgba(0,212,255,.35)",
    boxShadow: active ? "0 0 8px rgba(0,212,255,.25)" : "none",
  });

  return (
    <div style={{
      background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.12)",
      padding: "12px 16px", marginBottom: 20, position: "relative",
      clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,rgba(0,212,255,.5),transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {/* period presets */}
        <div style={{ display: "flex", gap: 5 }}>
          {presetBtns.map(b => (
            <button key={b.v} style={btnStyle(preset === b.v)} onClick={() => handlePreset(b.v)}>{b.l}</button>
          ))}
        </div>

        {/* custom days input */}
        {preset === "custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 8, color: "rgba(0,212,255,.4)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>DAYS:</span>
            <input
              type="number" min="1" max="365"
              value={customDays}
              onChange={e => handleDays(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleApply()}
              style={{
                width: 56, background: "rgba(0,212,255,.04)", border: "1px solid rgba(0,212,255,.2)",
                padding: "5px 8px", fontSize: 11, color: "#a8d4e6",
                fontFamily: "'Share Tech Mono',monospace", outline: "none",
                colorScheme: "dark", textAlign: "center",
              }}
            />
          </div>
        )}

        {/* divider */}
        <div style={{ width: 1, height: 20, background: "rgba(0,212,255,.12)", flexShrink: 0 }} />

        {/* end date */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 8, color: "rgba(0,212,255,.4)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>END:</span>
          <input
            type="date"
            value={localEndDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => handleEndDate(e.target.value)}
            style={{
              background: "rgba(0,212,255,.04)", border: "1px solid rgba(0,212,255,.2)",
              padding: "5px 8px", fontSize: 10, color: "#a8d4e6",
              fontFamily: "'Share Tech Mono',monospace", outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>

        {/* apply button */}
        <button
          onClick={handleApply}
          disabled={loading || !dirty}
          style={{
            marginLeft: "auto", padding: "6px 16px",
            background: dirty ? "rgba(0,212,255,.1)" : "rgba(0,212,255,.03)",
            border: `1px solid ${dirty ? "rgba(0,212,255,.4)" : "rgba(0,212,255,.1)"}`,
            color: dirty ? "#00d4ff" : "rgba(0,212,255,.2)",
            fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 1.5,
            cursor: dirty && !loading ? "pointer" : "default", transition: "all .2s",
            clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
          }}
        >
          {loading ? "[ LOADING... ]" : "[ APPLY ]"}
        </button>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

const DOMAIN_ICONS: Record<string, string> = {
  language: "◈", sleep: "◌", stress: "◈", habit: "✦",
  nutrition: "◇", programming: "⟨⟩", training: "△", body: "◉",
};

const todayISO = () => new Date().toISOString().split("T")[0];

export default function DomainModal({ id, onClose }: Props) {
  // ── domain base data (loaded once) ─────────────────────────────────────────
  const [domain, setDomain]   = useState<Domain | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);
  const [errorBase, setErrorBase]     = useState<string | null>(null);

  // ── analytics data (reloaded on period change) ─────────────────────────────
  const [analytics, setAnalytics]         = useState<DomainAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorAnalytics, setErrorAnalytics]     = useState<string | null>(null);

  // ── period selector state ──────────────────────────────────────────────────
  const [appliedPeriod, setAppliedPeriod]   = useState<AnalyticsParams["period"]>("weekly");
  const [appliedEndDate, setAppliedEndDate] = useState<string>(todayISO());
  const [tab, setTab] = useState<"overview" | "analytics">("overview");

  // abort controller to cancel in-flight analytics requests
  const analyticsAbortRef = useRef<AbortController | null>(null);

  // ── load base domain data ──────────────────────────────────────────────────
  const loadBase = useCallback(async () => {
    setLoadingBase(true); setErrorBase(null);
    try {
      const d = await fetchDomainDetail(id);
      setDomain(d);
      setMetrics(d.metrics ?? []);
      // Seed analytics from initial response (period=weekly, end=today by default)
      if (d.analytics) setAnalytics(d.analytics);
    } catch (e: any) {
      setErrorBase(e?.response?.data ? JSON.stringify(e.response.data) : e?.message ?? "SYSTEM ERROR");
    } finally {
      setLoadingBase(false);
    }
  }, [id]);

  useEffect(() => { loadBase(); }, [loadBase]);

  // ── load analytics with period params ─────────────────────────────────────
  const loadAnalytics = useCallback(async (period: AnalyticsParams["period"], endDate: string) => {
    // Cancel any previous in-flight request
    analyticsAbortRef.current?.abort();
    analyticsAbortRef.current = new AbortController();
    
    setLoadingAnalytics(true);
    setErrorAnalytics(null);
    
    try {
      const result = await fetchDomainAnalytics(id, { period, end_date: endDate });
      setAnalytics(result);
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return; // ignore aborted
      setErrorAnalytics(e?.response?.data ? JSON.stringify(e.response.data) : e?.message ?? "ANALYTICS ERROR");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [id]);

  // ── period apply handler ───────────────────────────────────────────────────
  const handlePeriodApply = useCallback((period: AnalyticsParams["period"], endDate: string) => {
    setAppliedPeriod(period);
    setAppliedEndDate(endDate);
    loadAnalytics(period, endDate);
  }, [loadAnalytics]);

  // ── optimistic metric update after logging ─────────────────────────────────
  const handleLogged = (mid: number, val: number) => {
    setMetrics(prev => prev.map(x => {
      if (x.id !== mid) return x;
      const newVal = x.aggregation_type === "sum" ? (x.latest_value ?? 0) + val : val;
      return { ...x, latest_value: newVal };
    }));
  };

  // ── derive analytics display data ──────────────────────────────────────────
  const slug            = analytics?.slug ?? "";
  const report          = analytics?.report ?? null;
  const summary         = report?.summary && typeof report.summary === "object" ? report.summary as Record<string, number> : null;
  const perMetric       = report?.per_metric && Object.keys(report.per_metric).length ? report.per_metric as Record<string, any> : null;
  const specificSummary = analytics?.specific_summary ?? null;
  const hasPeriod       = !!analytics?.period;
  
  const loading = loadingBase;
  const error   = errorBase;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
        @keyframes dm_fi   { from{opacity:0} to{opacity:1} }
        @keyframes dm_su   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes dm_spin { to{transform:rotate(360deg)} }
        @keyframes dm_scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(900px)} }
        .dm-scroll::-webkit-scrollbar { width:3px; }
        .dm-scroll::-webkit-scrollbar-thumb { background:rgba(0,212,255,.2); }
        .dm-tab-btn {
          padding:10px 20px; background:transparent; border:none;
          border-bottom:2px solid transparent; color:rgba(0,212,255,.3);
          font-family:'Orbitron',sans-serif; font-size:9px; font-weight:700;
          letter-spacing:3px; cursor:pointer; transition:all .2s; margin-bottom:-1px;
        }
        .dm-tab-btn:hover { color:rgba(0,212,255,.6); }
        .dm-tab-btn.on { color:#00d4ff; border-bottom-color:#00d4ff; text-shadow:0 0 8px rgba(0,212,255,.6); }
      `}</style>

      <div onClick={e => e.target === e.currentTarget && onClose()} style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,5,20,.9)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "dm_fi .2s ease",
      }}>
        <div style={{
          width: "100%", maxWidth: 900, maxHeight: "90vh",
          background: "linear-gradient(135deg,rgba(0,10,30,.99),rgba(0,20,50,.97))",
          border: "1px solid rgba(0,212,255,.2)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,212,255,.1), 0 40px 100px rgba(0,0,0,.8)",
          animation: "dm_su .3s cubic-bezier(.22,1,.36,1)",
          clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))",
          position: "relative",
        }}>
          {/* scan line */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,.012) 2px,rgba(0,212,255,.012) 4px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, height: 60, pointerEvents: "none", zIndex: 0, background: "linear-gradient(transparent,rgba(0,212,255,.03),transparent)", animation: "dm_scan 6s linear infinite" }} />

          {/* top bar */}
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#00d4ff,transparent)", flexShrink: 0, position: "relative", zIndex: 1 }} />

          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 14px", borderBottom: "1px solid rgba(0,212,255,.1)", flexShrink: 0, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.3)",
                clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#00d4ff", boxShadow: "0 0 12px rgba(0,212,255,.3)",
              }}>
                {DOMAIN_ICONS[domain?.slug ?? ""] ?? "⬡"}
              </div>
              <div>
                <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 3, fontFamily: "'Share Tech Mono',monospace", marginBottom: 3 }}>▸ DOMAIN INTERFACE / ID:{String(id).padStart(4, "0")}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#00d4ff", letterSpacing: 2, fontFamily: "'Orbitron',sans-serif", textShadow: "0 0 12px rgba(0,212,255,.4)" }}>
                  {domain?.name?.toUpperCase() ?? `DOMAIN #${id}`}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, background: "rgba(255,51,102,.05)",
              border: "1px solid rgba(255,51,102,.2)", color: "rgba(255,51,102,.5)",
              cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s", fontFamily: "'Share Tech Mono',monospace",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,51,102,.15)"; e.currentTarget.style.color = "#ff3366"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,51,102,.05)"; e.currentTarget.style.color = "rgba(255,51,102,.5)"; }}
            >✕</button>
          </div>

          {/* tabs */}
          {!loading && !error && domain && (
            <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: "1px solid rgba(0,212,255,.08)", flexShrink: 0, position: "relative", zIndex: 1 }}>
              <button className={`dm-tab-btn ${tab === "overview" ? "on" : ""}`} onClick={() => setTab("overview")}>OVERVIEW</button>
              <button className={`dm-tab-btn ${tab === "analytics" ? "on" : ""}`} onClick={() => setTab("analytics")}>ANALYTICS</button>
            </div>
          )}

          {/* body */}
          <div className="dm-scroll" style={{ flex: 1, overflowY: "auto", padding: 24, scrollbarWidth: "thin", scrollbarColor: "rgba(0,212,255,.2) transparent", position: "relative", zIndex: 1 }}>
            
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 16 }}>
                <div style={{ width: 36, height: 36, border: "2px solid rgba(0,212,255,.1)", borderTopColor: "#00d4ff", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", animation: "dm_spin .8s linear infinite" }} />
                <span style={{ color: "rgba(0,212,255,.4)", fontSize: 9, letterSpacing: 3, fontFamily: "'Share Tech Mono',monospace" }}>LOADING DOMAIN DATA...</span>
              </div>
            )}

            {!loading && error && (
              <div style={{ background: "rgba(255,51,102,.06)", border: "1px solid rgba(255,51,102,.25)", padding: "16px 20px", color: "rgba(255,100,130,.8)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 0.5 }}>
                <span style={{ color: "#ff3366", display: "block", marginBottom: 6, fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>[ SYSTEM ERROR ]</span>
                {error}
              </div>
            )}

            {!loading && !error && domain && (
              <>
                {/* ── overview ── */}
                {tab === "overview" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                      {[
                        { label: "DESIGNATION", value: domain.name },
                        { label: "SLUG / TYPE",  value: domain.slug },
                        { label: "INITIALIZED",  value: domain.created_at },
                        { label: "DESCRIPTION",  value: domain.description },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.1)", padding: "12px 16px", clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)", position: "relative" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,rgba(0,212,255,.3),transparent)" }} />
                          <div style={{ fontSize: 8, color: "rgba(0,212,255,.4)", letterSpacing: 2, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>▸ {label}</div>
                          <div style={{ fontSize: 12, color: value ? "#a8d4e6" : "rgba(0,212,255,.2)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 0.5, fontStyle: value ? "normal" : "italic" }}>{(value ?? "") || "—"}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 2, height: 14, background: "#00d4ff", boxShadow: "0 0 6px rgba(0,212,255,.6)" }} />
                      <span style={{ fontSize: 9, color: "#00d4ff", textTransform: "uppercase", letterSpacing: 3, fontFamily: "'Orbitron',sans-serif" }}>REGISTERED METRICS</span>
                      <span style={{ fontSize: 9, color: "rgba(0,212,255,.4)", padding: "2px 8px", border: "1px solid rgba(0,212,255,.2)", fontFamily: "'Share Tech Mono',monospace" }}>{metrics.length}</span>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(0,212,255,.3),transparent)" }} />
                    </div>

                    {metrics.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
                        {metrics.map(m => (
                          <MetricItem key={m.id} metric={m}
                            onDelete={mid => setMetrics(prev => prev.filter(x => x.id !== mid))}
                            onLogged={handleLogged}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "rgba(0,212,255,.2)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace", padding: "20px 0", letterSpacing: 1 }}>▸ NO METRICS REGISTERED</div>
                    )}

                    <AddMetricForm domainId={id} onAdded={m => setMetrics(prev => [...prev, m])} />
                  </>
                )}

                {/* ── analytics ── */}
                {tab === "analytics" && (
                  <>
                    {/* period selector */}
                    <PeriodSelector
                      period={appliedPeriod}
                      endDate={appliedEndDate}
                      loading={loadingAnalytics}
                      onApply={handlePeriodApply}
                    />

                    {/* analytics loading overlay */}
                    {loadingAnalytics && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", marginBottom: 16 }}>
                        <div style={{ width: 14, height: 14, border: "1.5px solid rgba(0,212,255,.15)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "dm_spin .6s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 9, color: "rgba(0,212,255,.4)", letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace" }}>RECALCULATING ANALYTICS...</span>
                      </div>
                    )}

                    {/* analytics error */}
                    {!loadingAnalytics && errorAnalytics && (
                      <div style={{ background: "rgba(255,51,102,.06)", border: "1px solid rgba(255,51,102,.25)", padding: "12px 16px", marginBottom: 16, color: "rgba(255,100,130,.8)", fontSize: 11, fontFamily: "'Share Tech Mono',monospace" }}>
                        <span style={{ color: "#ff3366", display: "block", marginBottom: 4, fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>[ ANALYTICS ERROR ]</span>
                        {errorAnalytics}
                      </div>
                    )}

                    {/* period badge */}
                    {hasPeriod && !loadingAnalytics && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,10,30,.9)", border: "1px solid rgba(0,212,255,.12)", padding: "10px 16px", marginBottom: 20, position: "relative", clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,rgba(0,212,255,.5),transparent)" }} />
                        <span style={{ background: "rgba(0,212,255,.1)", border: "1px solid rgba(0,212,255,.3)", color: "#00d4ff", padding: "3px 12px", fontSize: 9, fontFamily: "'Orbitron',sans-serif", letterSpacing: 2 }}>
                          {analytics!.period.type.toUpperCase()}
                        </span>
                        <span style={{ color: "rgba(0,212,255,.5)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
                          {analytics!.period.start} <span style={{ color: "rgba(0,212,255,.25)" }}>→</span> {analytics!.period.end}
                        </span>
                      </div>
                    )}

                    {/* analytics content */}
                    {!loadingAnalytics && (
                      <>
                        {summary && <SummaryGrid data={summary} />}
                        {specificSummary && slug && <SpecificInsights slug={slug} data={specificSummary} />}

                        {perMetric && (
                          <div style={{ marginTop: (summary || specificSummary) ? 28 : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <div style={{ width: 2, height: 14, background: "#bf7fff", boxShadow: "0 0 6px rgba(191,127,255,.6)" }} />
                              <span style={{ fontSize: 9, color: "#bf7fff", textTransform: "uppercase", letterSpacing: 3, fontFamily: "'Orbitron',sans-serif" }}>PER-METRIC ANALYSIS</span>
                              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(191,127,255,.3),transparent)" }} />
                            </div>
                            {Object.entries(perMetric).map(([k, v]) => (
                              <MetricAnalyticsCard key={k} metricKey={k} data={v as Record<string, any>} />
                            ))}
                          </div>
                        )}

                        {!summary && !perMetric && !specificSummary && (
                          <div style={{ color: "rgba(0,212,255,.2)", fontSize: 10, fontFamily: "'Share Tech Mono',monospace", padding: "30px 0", textAlign: "center", letterSpacing: 1 }}>
                            ▸ INSUFFICIENT DATA — LOG ENTRIES TO ACTIVATE ANALYTICS
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}