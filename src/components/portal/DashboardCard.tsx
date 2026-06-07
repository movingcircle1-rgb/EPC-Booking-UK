import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function DashboardCard({ title, icon: Icon, children, action }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-[#e71c5e] bg-opacity-10 rounded-full flex items-center justify-center">
              <Icon size={20} className="text-[#e71c5e]" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-[#e71c5e] hover:text-[#c91852] text-sm font-semibold transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
