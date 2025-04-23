
import React from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define chart color palette
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f97316", // orange
  "#8b5cf6", // purple
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
];

interface ChartDataItem {
  name: string;
  value: number;
}

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
      tension?: number;
    }[];
  };
  height?: number;
}

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  height?: number;
}

interface DoughnutOrPieChartProps {
  data: ChartDataItem[];
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} height={height} />;
}

export function BarChart({ data, height = 300 }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} height={height} />;
}

export function DoughnutChart({ data, height = 300 }: DoughnutOrPieChartProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: COLORS.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} height={height} />;
}

export function PieChart({ data, height = 300 }: DoughnutOrPieChartProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: COLORS.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
        },
      },
    },
  };

  return <Pie data={chartData} options={options} height={height} />;
}
