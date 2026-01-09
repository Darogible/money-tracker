import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardDonut({ data, total, currency = 'Kč' }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: 12, color: '#666', textAlign: 'center' }}>
                No expenses for this period
            </div>
        );
    }

    const totalText = Number(total || 0).toFixed(2);

    return (
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>

                    {/* ТЕКСТ В ЦЕНТРЕ */}
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-8" style={{ fontSize: 12, fill: '#666' }}>
                            Total
                        </tspan>
                        <tspan x="50%" dy="18" style={{ fontSize: 18, fontWeight: 700 }}>
                            {totalText} {currency}
                        </tspan>
                    </text>

                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
