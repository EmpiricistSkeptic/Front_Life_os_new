import React from "react";

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");

function scoreColor(v: number) {
  if (v >= 70) return "#00ff88";
  if (v >= 45) return "#ffcc00";
  return "#ff3366";
}

function scoreGlow(v: number) {
  if (v >= 70) return "rgba(0,255,136,.4)";
  if (v >= 45) return "rgba(255,204,0,.4)";
  return "rgba(255,51,102,.4)";
}

// ── bar ───────────────────────────────────────────────────────────────────────

export function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 3, background: "rgba(0,212,255,.08)", marginTop: 8, position: "relative" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(value, 100)}%`,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          transition: "width .8s cubic-bezier(.22,1,.36,1)",
        }}
      />
      {/* tick marks */}
      {[25, 50, 75].map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${t}%`,
            width: 1,
            background: "rgba(0,212,255,.15)",
          }}
        />
      ))}
    </div>
  );
}

// ── segmented energy bar ──────────────────────────────────────────────────────

export function SegmentBar({ value, color }: { value: number; color: string }) {
  const segments = 10;
  const filled = Math.round((Math.min(value, 100) / 100) * segments);
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            background: i < filled ? color : "rgba(0,212,255,.08)",
            boxShadow: i < filled ? `0 0 4px ${color}` : "none",
            transition: `background .4s ${i * 40}ms`,
            clipPath: "polygon(2px 0,100% 0,calc(100% - 2px) 100%,0 100%)",
          }}
        />
      ))}
    </div>
  );
}

// ── insight card ──────────────────────────────────────────────────────────────

export type InsightCardDef = {
  k: string;
  label: string;
  icon: string;
  format: (v: any) => string;
  color: (v: any) => string;
  showBar?: boolean;
};

export function InsightCard({ def, val }: { def: InsightCardDef; val: any }) {
  if (val === undefined || val === null) return null;
  const c = def.color(val);
  return (
    <div
      style={{
        background: "rgba(0,10,30,.9)",
        border: `1px solid ${c}30`,
        padding: "13px 15px",
        position: "relative",
        overflow: "hidden",
        transition: "all .2s",
        cursor: "default",
        clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${c}70`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 16px ${c}25`;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${c}30`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
      }}
    >
      {/* top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${c},transparent)`,
        }}
      />
      <div style={{ fontSize: 14, marginBottom: 6, filter: `drop-shadow(0 0 4px ${c})` }}>
        {def.icon}
      </div>
      <div
        style={{
          fontSize: 8,
          color: "rgba(0,212,255,.4)",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 6,
          fontFamily: "'Share Tech Mono',monospace",
        }}
      >
        {def.label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: c,
          fontFamily: "'Share Tech Mono',monospace",
          letterSpacing: 1,
          textShadow: `0 0 8px ${c}`,
        }}
      >
        {def.format(val)}
      </div>
      {def.showBar && <SegmentBar value={typeof val === "number" ? val : 0} color={c} />}
    </div>
  );
}

export function InsightRecommendations({ items, accent = "#00d4ff" }: { items: string[]; accent?: string }) {
  if (!items.length) return null;
  return (
    <div
      style={{
        background: `${accent}06`,
        border: `1px solid ${accent}20`,
        padding: "14px 18px",
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${accent},transparent)`,
        }}
      />
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 10,
          fontFamily: "'Orbitron',sans-serif",
        }}
      >
        ◈ SYSTEM RECOMMENDATIONS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                fontSize: 10,
                color: accent,
                flexShrink: 0,
                marginTop: 2,
                fontFamily: "'Share Tech Mono',monospace",
              }}
            >
              ▸
            </div>
            <span
              style={{
                fontSize: 12,
                color: "rgba(168,212,230,.7)",
                lineHeight: 1.6,
                fontFamily: "'Share Tech Mono',monospace",
                letterSpacing: 0.3,
              }}
            >
              {r}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightSection({
  title,
  accent,
  defs,
  data,
}: {
  title: string;
  accent: string;
  defs: InsightCardDef[];
  data: Record<string, any>;
}) {
  const recommendations: string[] = data.recommendations ?? [];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 2, height: 16, background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontFamily: "'Orbitron',sans-serif",
          }}
        >
          ◈ {title}
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accent}40,transparent)` }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginBottom: 16 }}>
        {defs.map((def) => (
          <InsightCard key={def.k} def={def} val={data[def.k]} />
        ))}
      </div>
      <InsightRecommendations items={recommendations} accent={accent} />
    </div>
  );
}

// ── language insights ─────────────────────────────────────────────────────────

const LANGUAGE_DEFS: InsightCardDef[] = [
  { k: "study_intensity_minutes_week", label: "STUDY / WEEK", icon: "⏱", format: (v) => `${fmt(v, 0)} MIN`, color: (v) => (v >= 300 ? "#00ff88" : v >= 120 ? "#ffcc00" : "#ff3366") },
  { k: "active_passive_ratio", label: "ACTIVE / PASSIVE", icon: "◈", format: (v) => (v !== null ? fmt(v, 2) : "—"), color: (v) => (v === null ? "#475569" : v >= 0.5 ? "#00ff88" : v >= 0.3 ? "#ffcc00" : "#ff3366") },
  { k: "skill_balance_index", label: "SKILL BALANCE", icon: "⚖", format: (v) => fmt(v, 1) + "%", color: (v) => scoreColor(v), showBar: true },
  { k: "vocab_rate_week", label: "NEW WORDS / WK", icon: "◇", format: (v) => `${fmt(v, 0)}`, color: (v) => (v <= 50 ? "#00ff88" : v <= 80 ? "#ffcc00" : "#ff3366") },
  { k: "vocab_retention", label: "RETENTION", icon: "△", format: (v) => fmt(v, 2) + "x", color: (v) => (v >= 1.5 ? "#00ff88" : v >= 0.5 ? "#ffcc00" : "#ff3366") },
  { k: "fluency_score", label: "FLUENCY", icon: "◉", format: (v) => fmt(v, 1) + "%", color: (v) => scoreColor(v), showBar: true },
  { k: "grammar_score", label: "GRAMMAR", icon: "✦", format: (v) => fmt(v, 1) + "%", color: (v) => scoreColor(v), showBar: true },
];

function LanguageInsights({ data }: { data: Record<string, any> }) {
  return <InsightSection title="LANGUAGE MODULE" accent="#00d4ff" defs={LANGUAGE_DEFS} data={data} />;
}

// ── sleep insights ────────────────────────────────────────────────────────────

const SLEEP_DEFS: InsightCardDef[] = [
  { k: "avg_sleep_hours_week", label: "AVG SLEEP", icon: "◌", format: (v) => `${fmt(v, 1)}H`, color: (v) => (v >= 7.5 ? "#00ff88" : v >= 6 ? "#ffcc00" : "#ff3366") },
  { k: "avg_sleep_quality_week", label: "QUALITY", icon: "⭐", format: (v) => (v !== null ? `${fmt(v, 1)}/5` : "—"), color: (v) => (v === null ? "#475569" : v >= 4 ? "#00ff88" : v >= 3 ? "#ffcc00" : "#ff3366") },
  { k: "avg_awakenings", label: "AWAKENINGS", icon: "◈", format: (v) => (v !== null ? fmt(v, 1) : "—"), color: (v) => (v === null ? "#475569" : v <= 1 ? "#00ff88" : v <= 2 ? "#ffcc00" : "#ff3366") },
  { k: "pct_nights_meeting_target", label: "TARGET NIGHTS", icon: "✦", format: (v) => (v !== null ? `${fmt(v, 0)}%` : "—"), color: (v) => (v === null ? "#475569" : v >= 80 ? "#00ff88" : v >= 50 ? "#ffcc00" : "#ff3366"), showBar: true },
  { k: "sleep_variability_hours", label: "VARIABILITY", icon: "△", format: (v) => `${fmt(v, 2)}H`, color: (v) => (v <= 0.5 ? "#00ff88" : v <= 1.5 ? "#ffcc00" : "#ff3366") },
  { k: "sleep_debt_estimate", label: "SLEEP DEBT", icon: "⏳", format: (v) => (v !== null ? `${fmt(v, 1)}H` : "—"), color: (v) => (v === null ? "#475569" : v <= 0 ? "#00ff88" : v <= 2 ? "#ffcc00" : "#ff3366") },
  { k: "bedtime_mean", label: "BEDTIME", icon: "◌", format: (v) => v ?? "—", color: (_v) => "#00d4ff" },
  { k: "bedtime_std_minutes", label: "BEDTIME SPREAD", icon: "◇", format: (v) => (v !== null ? `±${v}M` : "—"), color: (v) => (v === null ? "#475569" : v <= 20 ? "#00ff88" : v <= 60 ? "#ffcc00" : "#ff3366") },
  { k: "wake_time_mean", label: "WAKE TIME", icon: "◉", format: (v) => v ?? "—", color: (_v) => "#ffcc00" },
  { k: "wake_time_std_minutes", label: "WAKE SPREAD", icon: "△", format: (v) => (v !== null ? `±${v}M` : "—"), color: (v) => (v === null ? "#475569" : v <= 20 ? "#00ff88" : v <= 60 ? "#ffcc00" : "#ff3366") },
  { k: "sleep_midpoint_variability_minutes", label: "CIRCADIAN", icon: "🔄", format: (v) => (v !== null ? `±${fmt(v, 0)}M` : "—"), color: (v) => (v === null ? "#475569" : v <= 20 ? "#00ff88" : v <= 45 ? "#ffcc00" : "#ff3366") },
];

function SleepInsights({ data }: { data: Record<string, any> }) {
  return <InsightSection title="SLEEP MODULE" accent="#6366f1" defs={SLEEP_DEFS} data={data} />;
}

// ── stress insights ───────────────────────────────────────────────────────────

const STRESS_DEFS: InsightCardDef[] = [
  { k: "avg_stress_level", label: "STRESS LEVEL", icon: "◈", format: (v) => `${fmt(v, 1)}/5`, color: (v) => (v <= 2 ? "#00ff88" : v <= 3.5 ? "#ffcc00" : "#ff3366") },
  { k: "stress_label", label: "STATUS", icon: "◉", format: (v) => (v ?? "—").toUpperCase(), color: (_v) => "#a8d4e6" },
  { k: "stress_trend", label: "TREND", icon: "△", format: (v) => (v !== null ? (v < 0 ? "" : "+") + fmt(v * 100, 1) + "%" : "—"), color: (v) => (v === null ? "#475569" : v <= 0 ? "#00ff88" : "#ff3366") },
  { k: "recovery_score", label: "RECOVERY", icon: "✦", format: (v) => `${fmt(v, 0)}%`, color: (v) => scoreColor(v), showBar: true },
  { k: "total_recovery_minutes", label: "RECOVERY MIN", icon: "⏱", format: (v) => `${fmt(v, 0)}`, color: (v) => (v >= 300 ? "#00ff88" : v >= 120 ? "#ffcc00" : "#ff3366") },
  { k: "total_meditation_minutes", label: "MEDITATION", icon: "◌", format: (v) => `${fmt(v, 0)}M`, color: (v) => (v >= 70 ? "#00ff88" : v >= 30 ? "#ffcc00" : "#ff3366") },
  { k: "total_exercise_minutes", label: "EXERCISE", icon: "△", format: (v) => `${fmt(v, 0)}M`, color: (v) => (v >= 120 ? "#00ff88" : v >= 60 ? "#ffcc00" : "#ff3366") },
  { k: "total_relaxation_minutes", label: "RELAXATION", icon: "◇", format: (v) => `${fmt(v, 0)}M`, color: (v) => (v >= 150 ? "#00ff88" : v >= 60 ? "#ffcc00" : "#ff3366") },
  { k: "recovery_per_stress_point", label: "REC/STRESS PT", icon: "⚖", format: (v) => (v !== null ? `${fmt(v, 0)}M` : "—"), color: (v) => (v === null ? "#475569" : v >= 60 ? "#00ff88" : v >= 30 ? "#ffcc00" : "#ff3366") },
];

function StressInsights({ data }: { data: Record<string, any> }) {
  return <InsightSection title="STRESS MODULE" accent="#ff3366" defs={STRESS_DEFS} data={data} />;
}

// ── habit insights ────────────────────────────────────────────────────────────

const HABIT_SUMMARY_DEFS: InsightCardDef[] = [
  { k: "total_habits", label: "TOTAL HABITS", icon: "◈", format: (v) => `${v}`, color: (_v) => "#00d4ff" },
  { k: "habits_on_track", label: "ON TRACK", icon: "✦", format: (v) => `${v}`, color: (v) => (v > 0 ? "#00ff88" : "#ff3366") },
  { k: "avg_completion_rate", label: "AVG COMPLETION", icon: "◉", format: (v) => `${fmt(v * 100, 0)}%`, color: (v) => (v >= 0.8 ? "#00ff88" : v >= 0.5 ? "#ffcc00" : "#ff3366"), showBar: true },
  { k: "longest_active_streak", label: "BEST STREAK", icon: "🔥", format: (v) => `${v}D`, color: (v) => (v >= 7 ? "#00ff88" : v >= 3 ? "#ffcc00" : "#ff3366") },
  { k: "best_habit_rate", label: "TOP HABIT %", icon: "⭐", format: (v) => `${fmt(v * 100, 0)}%`, color: (v) => (v >= 0.8 ? "#00ff88" : v >= 0.5 ? "#ffcc00" : "#ff3366") },
  { k: "worst_habit_rate", label: "WEAK HABIT %", icon: "△", format: (v) => `${fmt(v * 100, 0)}%`, color: (v) => (v >= 0.8 ? "#00ff88" : v >= 0.5 ? "#ffcc00" : "#ff3366") },
];

function HabitRow({ habit }: { habit: any }) {
  const rate = habit.completion_rate as number;
  const color = rate >= 0.8 ? "#00ff88" : rate >= 0.5 ? "#ffcc00" : "#ff3366";
  return (
    <div
      style={{
        background: "rgba(0,10,30,.9)",
        border: `1px solid ${color}25`,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${color}60,transparent)`,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#e8f4ff",
            marginBottom: 8,
            fontFamily: "'Share Tech Mono',monospace",
            letterSpacing: 0.5,
          }}
        >
          {habit.name.toUpperCase()}
          {habit.on_track && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 9,
                color: "#00ff88",
                fontFamily: "'Orbitron',sans-serif",
                letterSpacing: 1,
              }}
            >
              ▸ ON TRACK
            </span>
          )}
        </div>
        <SegmentBar value={rate * 100} color={color} />
      </div>
      <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color,
              fontFamily: "'Share Tech Mono',monospace",
              textShadow: `0 0 8px ${color}`,
            }}
          >
            {fmt(rate * 100, 0)}%
          </div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(0,212,255,.4)",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "'Share Tech Mono',monospace",
            }}
          >
            RATE
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: habit.current_streak >= 7 ? "#00ff88" : "#ffcc00",
              fontFamily: "'Share Tech Mono',monospace",
            }}
          >
            {habit.current_streak}
          </div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(0,212,255,.4)",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "'Share Tech Mono',monospace",
            }}
          >
            STREAK
          </div>
        </div>
      </div>
    </div>
  );
}

function HabitInsights({ data }: { data: Record<string, any> }) {
  const habits: any[] = data.habits ?? [];
  const accent = "#ffcc00";
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 2, height: 16, background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontFamily: "'Orbitron',sans-serif",
          }}
        >
          ◈ HABIT MODULE
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accent}40,transparent)` }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginBottom: 16 }}>
        {HABIT_SUMMARY_DEFS.map((def) => (
          <InsightCard key={def.k} def={def} val={data[def.k]} />
        ))}
      </div>
      {(data.best_habit || data.worst_habit) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {data.best_habit && (
            <div
              style={{
                background: "rgba(0,255,136,.05)",
                border: "1px solid rgba(0,255,136,.2)",
                padding: "10px 14px",
                clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: "#00ff88",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 6,
                  fontFamily: "'Orbitron',sans-serif",
                }}
              >
                ⭐ TOP PERFORMER
              </div>
              <div style={{ fontSize: 12, color: "#e8f4ff", fontFamily: "'Share Tech Mono',monospace" }}>
                {data.best_habit.toUpperCase()}
              </div>
            </div>
          )}
          {data.worst_habit && (
            <div
              style={{
                background: "rgba(255,51,102,.05)",
                border: "1px solid rgba(255,51,102,.2)",
                padding: "10px 14px",
                clipPath: "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: "#ff3366",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 6,
                  fontFamily: "'Orbitron',sans-serif",
                }}
              >
                △ NEEDS ATTENTION
              </div>
              <div style={{ fontSize: 12, color: "#e8f4ff", fontFamily: "'Share Tech Mono',monospace" }}>
                {data.worst_habit.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      )}
      {habits.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {habits.map((h, i) => (
            <HabitRow key={i} habit={h} />
          ))}
        </div>
      )}
      <InsightRecommendations items={data.recommendations ?? []} accent={accent} />
    </div>
  );
}

// ── nutrition insights ────────────────────────────────────────────────────────

const NUTRITION_DEFS: InsightCardDef[] = [
  { k: "avg_daily_calories", label: "CALORIES/DAY", icon: "🔥", format: (v) => `${fmt(v, 0)}`, color: (v) => (v <= 2200 ? "#00ff88" : v <= 2600 ? "#ffcc00" : "#ff3366") },
  { k: "calorie_goal_delta", label: "DEFICIT/SURPLUS", icon: "⚖", format: (v) => (v !== null ? (v > 0 ? "+" : "") + fmt(v, 0) : "—"), color: (v) => (v === null ? "#475569" : Math.abs(v) <= 100 ? "#00ff88" : Math.abs(v) <= 300 ? "#ffcc00" : "#ff3366") },
  { k: "pct_days_on_target", label: "ON TARGET", icon: "✦", format: (v) => (v !== null ? `${fmt(v, 0)}%` : "—"), color: (v) => (v === null ? "#475569" : v >= 80 ? "#00ff88" : v >= 50 ? "#ffcc00" : "#ff3366"), showBar: true },
  { k: "calorie_variability", label: "VARIABILITY", icon: "△", format: (v) => (v !== null ? `±${fmt(v, 0)}` : "—"), color: (v) => (v === null ? "#475569" : v <= 200 ? "#00ff88" : v <= 400 ? "#ffcc00" : "#ff3366") },
  { k: "avg_protein_g", label: "PROTEIN", icon: "◈", format: (v) => (v !== null ? `${fmt(v, 0)}G` : "—"), color: (v) => (v === null ? "#475569" : v >= 150 ? "#00ff88" : v >= 100 ? "#ffcc00" : "#ff3366") },
  { k: "avg_fat_g", label: "FAT", icon: "◇", format: (v) => (v !== null ? `${fmt(v, 0)}G` : "—"), color: (v) => (v === null ? "#475569" : v <= 65 ? "#00ff88" : v <= 90 ? "#ffcc00" : "#ff3366") },
  { k: "avg_carbs_g", label: "CARBS", icon: "◉", format: (v) => (v !== null ? `${fmt(v, 0)}G` : "—"), color: (v) => (v === null ? "#475569" : v <= 220 ? "#00ff88" : v <= 280 ? "#ffcc00" : "#ff3366") },
  { k: "macro_balance_score", label: "MACRO BALANCE", icon: "⬡", format: (v) => (v !== null ? `${fmt(v, 0)}` : "—"), color: (v) => (v === null ? "#475569" : scoreColor(v)), showBar: true },
  { k: "protein_per_100kcal", label: "PROTEIN/100KCAL", icon: "△", format: (v) => (v !== null ? `${fmt(v, 1)}G` : "—"), color: (v) => (v === null ? "#475569" : v >= 7 ? "#00ff88" : v >= 4 ? "#ffcc00" : "#ff3366") },
  { k: "avg_water_ml", label: "WATER/DAY", icon: "◌", format: (v) => (v !== null ? `${fmt(v / 1000, 1)}L` : "—"), color: (v) => (v === null ? "#475569" : v >= 2500 ? "#00ff88" : v >= 1500 ? "#ffcc00" : "#ff3366") },
  { k: "water_goal_pct", label: "WATER TARGET", icon: "◉", format: (v) => (v !== null ? `${fmt(v, 0)}%` : "—"), color: (v) => (v === null ? "#475569" : v >= 90 ? "#00ff88" : v >= 60 ? "#ffcc00" : "#ff3366"), showBar: true },
];

function MacroBar({ data }: { data: Record<string, any> }) {
  const protein = data.macro_protein_pct as number | null;
  const fat = data.macro_fat_pct as number | null;
  const carbs = data.macro_carbs_pct as number | null;
  const tP = data.target_protein_pct as number | null;
  const tF = data.target_fat_pct as number | null;
  const tC = data.target_carbs_pct as number | null;
  
  if (!protein || !fat || !carbs) return null;
  
  return (
    <div
      style={{
        background: "rgba(0,10,30,.9)",
        border: "1px solid rgba(0,212,255,.15)",
        padding: "16px 18px",
        marginTop: 14,
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent)",
        }}
      />
      <div
        style={{
          fontSize: 8,
          color: "rgba(0,212,255,.5)",
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 14,
          fontFamily: "'Orbitron',sans-serif",
        }}
      >
        ◈ MACRO DISTRIBUTION
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "rgba(0,212,255,.4)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
            ACTUAL
          </span>
          <div style={{ display: "flex", gap: 14, fontSize: 10, fontFamily: "'Share Tech Mono',monospace" }}>
            <span style={{ color: "#00d4ff" }}>P:{fmt(protein, 0)}%</span>
            <span style={{ color: "#ffcc00" }}>F:{fmt(fat, 0)}%</span>
            <span style={{ color: "#bf7fff" }}>C:{fmt(carbs, 0)}%</span>
          </div>
        </div>
        <div style={{ height: 10, display: "flex", gap: 1 }}>
          <div style={{ width: `${protein}%`, background: "#00d4ff", boxShadow: "0 0 6px rgba(0,212,255,.6)", transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
          <div style={{ width: `${fat}%`, background: "#ffcc00", boxShadow: "0 0 6px rgba(255,204,0,.6)", transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
          <div style={{ width: `${carbs}%`, background: "#bf7fff", boxShadow: "0 0 6px rgba(191,127,255,.6)", transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
        </div>
      </div>
      {tP && tF && tC && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: "rgba(0,212,255,.3)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
              TARGET
            </span>
            <div style={{ display: "flex", gap: 14, fontSize: 10, fontFamily: "'Share Tech Mono',monospace", opacity: 0.5 }}>
              <span style={{ color: "#00d4ff" }}>P:{fmt(tP, 0)}%</span>
              <span style={{ color: "#ffcc00" }}>F:{fmt(tF, 0)}%</span>
              <span style={{ color: "#bf7fff" }}>C:{fmt(tC, 0)}%</span>
            </div>
          </div>
          <div style={{ height: 5, display: "flex", gap: 1, opacity: 0.35 }}>
            <div style={{ width: `${tP}%`, background: "#00d4ff" }} />
            <div style={{ width: `${tF}%`, background: "#ffcc00" }} />
            <div style={{ width: `${tC}%`, background: "#bf7fff" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function NutritionInsights({ data }: { data: Record<string, any> }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 2, height: 16, background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#00ff88",
            textTransform: "uppercase",
            letterSpacing: 3,
            fontFamily: "'Orbitron',sans-serif",
          }}
        >
          ◈ NUTRITION MODULE
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(0,255,136,.4),transparent)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginBottom: 14 }}>
        {NUTRITION_DEFS.map((def) => (
          <InsightCard key={def.k} def={def} val={data[def.k]} />
        ))}
      </div>
      <MacroBar data={data} />
      <div style={{ marginTop: 14 }}>
        <InsightRecommendations items={data.recommendations ?? []} accent="#00ff88" />
      </div>
    </div>
  );
}

// ── router ────────────────────────────────────────────────────────────────────

export function SpecificInsights({ slug, data }: { slug: string; data: Record<string, any> }) {
  if (slug === "language") return <LanguageInsights data={data} />;
  if (slug === "sleep") return <SleepInsights data={data} />;
  if (slug === "stress") return <StressInsights data={data} />;
  if (slug === "habit") return <HabitInsights data={data} />;
  if (slug === "nutrition") return <NutritionInsights data={data} />;
  return null;
}