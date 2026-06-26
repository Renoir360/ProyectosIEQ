'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts'

interface StatusData {
    name: string
    value: number
    fill: string
    [key: string]: string | number
}

interface ProjectData {
    name: string
    progress: number
    done: number
    total: number
    [key: string]: string | number
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 border-none rounded-lg shadow-xl text-xs font-semibold">
                <p className="text-slate-500 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill || payload[0].color }} />
                    <span className="text-slate-800">{payload[0].name}: {payload[0].value}</span>
                </div>
            </div>
        )
    }
    return null
}

// Chart 1: Donut for Task Status
export function StatusChart({ data }: { data: StatusData[] }) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0)

    const GRADIENT_IDS = [
        'url(#grad-backlog)',
        'url(#grad-ready)',
        'url(#grad-inprogress)',
        'url(#grad-done)'
    ]

    return (
        <div className="col-span-1 glass-card rounded-xl shadow-md transition-all overflow-hidden group hover:glass-card-hover">
            <div className="p-6 pb-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Distribución por Estado</h3>
            </div>
            <div className="h-[280px] pt-0 px-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            <linearGradient id="grad-backlog" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#475569" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="grad-ready" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="grad-inprogress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2BB9BF" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#177388" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="grad-done" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#15803d" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={GRADIENT_IDS[index % GRADIENT_IDS.length]} className="hover:opacity-85 transition-opacity outline-none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-900 font-bold text-2xl"
                        >
                            {total}
                        </text>
                        <text
                            x="50%"
                            y="58%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-400 text-[10px] uppercase tracking-wider font-semibold"
                        >
                            Total Tareas
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="px-6 pb-6 pt-0 grid grid-cols-2 gap-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                        <span className="truncate">{item.name}</span>
                        <span className="ml-auto text-slate-400 font-normal">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Chart 2: Bar for Project Progress
export function ProgressChart({ data }: { data: ProjectData[] }) {
    return (
        <div className="col-span-1 glass-card rounded-xl shadow-md transition-all overflow-hidden group hover:glass-card-hover">
            <div className="p-6 pb-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Progreso por Proyecto</h3>
            </div>
            <div className="h-[280px] pt-4 px-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#1CB7BE" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#226E80" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                            interval={0}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="progress"
                            fill="url(#barGradient)"
                            radius={[0, 6, 6, 0]}
                            barSize={14}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
