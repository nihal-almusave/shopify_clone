"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PlatformStats } from "@/lib/platform"

/*
 * Palette: reference categorical slots in fixed order, validated with the dataviz
 * validator on light (all checks pass; slots 3–5 have a contrast WARN, so the
 * activity chart ships with a table of the same numbers).
 */
const SLOT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"]
const GRID = "#e3e6df"
const INK_MUTED = "#5d6b63"

const tickDay = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
const axisProps = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: INK_MUTED } } as const
const tooltipProps = {
  contentStyle: { borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 12, color: "#12201a" },
  labelFormatter: (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
}

function Frame({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {note && <p className="mt-0.5 text-[13px] text-[#5d6b63]">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function TrafficChart({ daily }: { daily: PlatformStats["daily"] }) {
  const empty = daily.every((d) => d.views === 0)
  return (
    <Frame title="Storefront traffic" note="Page views and unique visitors per day, across all stores">
      {empty ? (
        <Empty>No storefront visits recorded yet. Visits are counted from now on.</Empty>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="day" tickFormatter={tickDay} minTickGap={28} {...axisProps} />
              <YAxis allowDecimals={false} width={36} {...axisProps} />
              <Tooltip {...tooltipProps} cursor={{ stroke: "#b9c2bc", strokeDasharray: "3 3" }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#12201a" }} />
              <Line type="linear" dataKey="views" name="Page views" stroke={SLOT[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
              <Line type="linear" dataKey="visitors" name="Visitors" stroke={SLOT[1]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Frame>
  )
}

export function DailyBars({ daily, field, title, note, label }: { daily: PlatformStats["daily"]; field: "orders" | "new_stores"; title: string; note: string; label: string }) {
  return (
    <Frame title={title} note={note}>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daily} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="day" tickFormatter={tickDay} minTickGap={28} {...axisProps} />
            <YAxis allowDecimals={false} width={30} {...axisProps} />
            <Tooltip {...tooltipProps} cursor={{ fill: "#f2f3ef" }} />
            <Bar dataKey={field} name={label} fill={SLOT[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Frame>
  )
}

const EVENTS = [
  { key: "ev_login", label: "Logins" },
  { key: "ev_product_created", label: "Products added" },
  { key: "ev_product_updated", label: "Products edited" },
  { key: "ev_order_fulfilled", label: "Orders fulfilled" },
  { key: "ev_settings_updated", label: "Settings changed" },
] as const

export function ActivityChart({ daily }: { daily: PlatformStats["daily"] }) {
  const totals = EVENTS.map((e) => ({ ...e, total: daily.reduce((s, d) => s + Number(d[e.key] ?? 0), 0) }))
  const empty = totals.every((t) => t.total === 0)
  return (
    <Frame title="Merchant activity" note="What merchants did in their admin each day">
      {empty ? (
        <Empty>No merchant activity recorded yet. Logins and edits are tracked from now on.</Empty>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="day" tickFormatter={tickDay} minTickGap={28} {...axisProps} />
                <YAxis allowDecimals={false} width={30} {...axisProps} />
                <Tooltip {...tooltipProps} cursor={{ fill: "#f2f3ef" }} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12, color: "#12201a" }} />
                {EVENTS.map((e, i) => (
                  <Bar key={e.key} dataKey={e.key} name={e.label} stackId="a" fill={SLOT[i]} stroke="#ffffff" strokeWidth={2} maxBarSize={22} radius={i === EVENTS.length - 1 ? [4, 4, 0, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="mt-4 w-full text-[13px]">
            <caption className="sr-only">Merchant activity totals for the period</caption>
            <tbody className="divide-y divide-[#eceee9]">
              {totals.map((t, i) => (
                <tr key={t.key}>
                  <td className="py-1.5">
                    <span className="mr-2 inline-block size-2.5 rounded-[3px] align-middle" style={{ background: SLOT[i] }} aria-hidden />
                    {t.label}
                  </td>
                  <td className="py-1.5 text-right font-medium tabular-nums">{t.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Frame>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="grid h-40 place-items-center rounded-xl bg-[#f7f8f5] px-6 text-center text-sm text-[#5d6b63]">{children}</div>
}
