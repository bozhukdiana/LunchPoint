import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type BarChartCardProps = {
  title: string;
  data: Record<string, string | number>[];
  bars: { key: string; color: string; label: string }[];
  xAxisKey?: string;
};

export function BarChartCard({ title, data, bars, xAxisKey = 'name' }: BarChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer height={240} width="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar dataKey={bar.key} fill={bar.color} key={bar.key} name={bar.label} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
