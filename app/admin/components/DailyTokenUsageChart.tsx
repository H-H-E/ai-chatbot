'use client';

import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type DailyStatsProps = {
  data: Array<{
    date: string;
    totalTokens: number;
  }>;
};

// Memoized chart component to avoid unnecessary re-renders
function DailyTokenUsageChart({ data }: DailyStatsProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date: string) => new Date(date).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
          formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
        />
        <Legend />
        <Bar dataKey="totalTokens" fill="#8884d8" name="Total Tokens" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(DailyTokenUsageChart);
