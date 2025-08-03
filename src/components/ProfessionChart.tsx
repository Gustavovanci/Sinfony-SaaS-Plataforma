import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserProfile } from '../types';

interface ProfessionChartProps {
  employees: UserProfile[];
}

// Paleta de cores para o gráfico
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#FF4560', '#775DD0'];

const ProfessionChart = ({ employees }: ProfessionChartProps) => {
  // Processa os dados dos funcionários para o formato que o gráfico precisa
  const professionData = employees.reduce((acc, employee) => {
    const profession = employee.profession || 'Não Definida';
    const existingEntry = acc.find(entry => entry.name === profession);
    if (existingEntry) {
      existingEntry.value += 1;
    } else {
      acc.push({ name: profession, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (professionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Nenhum dado de função para exibir.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={professionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {professionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} funcionário(s)`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// A linha mais importante que corrige o erro:
export default ProfessionChart;
