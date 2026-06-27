import React from 'react';
import type { DateFilter } from '../../type/AdminDashboard';


interface Props {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

export const FilterArea: React.FC<Props> = ({ currentFilter, onFilterChange }) => {
  const filters: { id: DateFilter; label: string }[] = [
    { id: 'DAY', label: 'Ngày' },
    { id: 'MONTH', label: 'Tháng' },
    { id: 'YEAR', label: 'Năm' }
  ];

  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <p className="text-secondary font-body-md mb-2">Chỉ số hiệu suất cho</p>
        <div className="flex gap-2">
          {filters.map(f => (
            <button 
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-4 py-2 font-label-md rounded border transition-colors ${
                currentFilter === f.id 
                  ? 'bg-primary-container text-on-primary-container border-primary/20' 
                  : 'bg-surface-container-lowest text-on-surface border-border-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};