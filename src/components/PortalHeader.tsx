import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PortalHeaderProps {
  title: string;
}

export default function PortalHeader({ title }: PortalHeaderProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <a href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#be0e0c] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Website</span>
            </a>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <h1 className="hidden sm:block text-xl font-bold text-gray-900">{title}</h1>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#be0e0c] hover:bg-gray-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
