"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatMoney } from "@/lib/format"

export function SalesChart({ data, currency }: { data: { date: string; label: string; sales: number }[]; currency: string }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#005bd3" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#005bd3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ebebeb" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#616161" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "#616161" }}
            tickFormatter={(v) => formatMoney(v, currency).replace(/\.00$/, "")}
          />
          <Tooltip
            cursor={{ stroke: "#b5b5b5", strokeDasharray: "3 3" }}
            contentStyle={{ borderRadius: 10, border: "1px solid #e3e3e3", fontSize: 12 }}
            formatter={(v: number) => [formatMoney(v, currency), "Sales"]}
          />
          <Area type="monotone" dataKey="sales" stroke="#005bd3" strokeWidth={2} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
