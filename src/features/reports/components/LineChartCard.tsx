import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type LineChartCardProps = {
  title: string;
  data: Record<string, string | number>[];
  lines: { key: string; color: string; label: string }[];
  xAxisKey?: string;
};

export function LineChartCard({ title, data, lines, xAxisKey = 'date' }: LineChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer height={240} width="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              dataKey={line.key}
              dot={false}
              key={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
