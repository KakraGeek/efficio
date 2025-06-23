import React from 'react';

// Props: icon (React element), value (string/number), label (string), optional color
interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconColor?: string; // Tailwind color class, e.g. 'text-blue-500'
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  iconColor = 'text-blue-500',
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
      <div className={`mb-2 text-3xl ${iconColor}`}>{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-gray-500 text-sm text-center">{label}</div>
    </div>
  );
};

export default MetricCard;
