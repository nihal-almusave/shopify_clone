"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatMoney } from "@/lib/format"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function SalesChart({ data, currency }: { data: { date: string; label: string; sales: number }[]; currency: string }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b3d2c" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#0b3d2c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e3e6df" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#5d6b63" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 11, fill: "#5d6b63" }}
            tickFormatter={(v: number) => compact.format(v)}
          />
          <Tooltip
            cursor={{ stroke: "#b9c2bc", strokeDasharray: "3 3" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e3e6df", fontSize: 12 }}
            formatter={(v: number) => [formatMoney(v, currency), "Sales"]}
          />
          <Area type="monotone" dataKey="sales" stroke="#0b3d2c" strokeWidth={2.25} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
