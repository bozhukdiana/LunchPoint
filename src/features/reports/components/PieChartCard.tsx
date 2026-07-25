import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type PieSlice = { name: string; value: number };

type PieChartCardProps = {
  title: string;
  data: PieSlice[];
  colors?: string[];
};

const DEFAULT_COLORS = ['#059669', '#64748b', '#ef4444', '#f59e0b'];

export function PieChartCard({ title, data, colors = DEFAULT_COLORS }: PieChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer height={220} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={50}
            label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
            labelLine={false}
            outerRadius={90}
          >
            {data.map((entry, index) => (
              <Cell fill={colors[index % colors.length]} key={entry.name} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
