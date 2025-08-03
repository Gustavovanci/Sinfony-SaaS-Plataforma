import { X } from 'lucide-react';

interface InsightModalProps {
  title: string;
  data: any[];
  columns: { header: string; accessor: string }[];
  onClose: () => void;
}

const InsightModal = ({ title, data, columns, onClose }: InsightModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {columns.map(col => (
                  <th key={col.accessor} className="p-4 font-semibold text-sm">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.accessor} className="p-4 text-sm text-gray-700">{item[col.accessor] || 'N/D'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
