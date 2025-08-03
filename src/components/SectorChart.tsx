import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserProfile } from '../types';

interface SectorChartProps {
  employees: UserProfile[];
}

// Usaremos uma paleta de cores diferente para diferenciar os gráficos
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#ffc0cb'];

const SectorChart = ({ employees }: SectorChartProps) => {
  // 1. Processa os dados dos funcionários, agrupando por 'sector'
  const sectorData = employees.reduce((acc, employee) => {
    const sector = employee.sector || 'Não Definido';
    const existingEntry = acc.find(entry => entry.name === sector);
    if (existingEntry) {
      existingEntry.value += 1;
    } else {
      acc.push({ name: sector, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (sectorData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Nenhum dado de setor para exibir.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={sectorData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {sectorData.map((entry, index) => (
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
export default SectorChart;
