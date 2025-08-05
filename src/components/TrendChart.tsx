// src/components/TrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EnrichedFeedback } from '../services/feedbackService';
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
  feedbacks: EnrichedFeedback[];
}

const TrendChart = ({ feedbacks }: TrendChartProps) => {
  // 1. Agrupar feedbacks por dia e calcular a média do CSAT
  const dailyData = feedbacks.reduce((acc, fb) => {
    const day = format(fb.createdAt, 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = { totalCsat: 0, count: 0 };
    }
    acc[day].totalCsat += fb.csat;
    acc[day].count += 1;
    return acc;
  }, {} as Record<string, { totalCsat: number; count: number }>);

  // 2. Formatar os dados para o gráfico e ordenar por data
  const chartData = Object.entries(dailyData)
    .map(([date, { totalCsat, count }]) => ({
      date: format(parseISO(date), 'dd/MM'),
      'Satisfação Média (CSAT)': parseFloat((totalCsat / count).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Dados insuficientes para exibir a tendência.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value) => [`${value} de 5`, 'CSAT']}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line 
            type="monotone" 
            dataKey="Satisfação Média (CSAT)" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;