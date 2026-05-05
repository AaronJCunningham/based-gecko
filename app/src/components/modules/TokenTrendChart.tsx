import {
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Line,
} from "recharts";
import CustomTooltip from "./CustomToolTip";

interface TokenTrendChartProps {
  data: Array<{ date: string; priceUSD: string }>;
}

const TokenTrendChart: React.FC<TokenTrendChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    date: item.date,
    price: parseFloat(parseFloat(item.priceUSD).toFixed(2)),
  }));

  return (
    <LineChart
      width={120}
      height={50}
      data={chartData}
      margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
    >
      <XAxis dataKey="date" hide />
      <YAxis hide />
      <RechartsTooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey="price"
        stroke="#00ffff"
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  );
};

export default TokenTrendChart;
