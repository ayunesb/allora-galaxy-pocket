
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AgentStats } from './hooks/useAgentStats';

interface AgentPerformanceChartProps {
  data: AgentStats[];
  metric: string;
}

export default function AgentPerformanceChart({ data, metric }: AgentPerformanceChartProps) {
  // Format data for the chart
  const chartData = data.map(agent => ({
    name: agent.agentName,
    value: agent[metric as keyof AgentStats],
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            {metric === 'successRate' && `Success Rate: ${payload[0].value?.toFixed(1)}%`}
            {metric === 'averageExecutionTime' && `Execution Time: ${payload[0].value?.toFixed(1)}ms`}
            {metric === 'totalTasks' && `Total Tasks: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Adjust bar colors based on metric
  const getBarColor = () => {
    switch (metric) {
      case 'successRate': return '#10b981'; // Green
      case 'averageExecutionTime': return '#6366f1'; // Indigo
      case 'totalTasks': return '#f59e0b'; // Amber
      default: return '#6366f1'; // Indigo
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill={getBarColor()}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
