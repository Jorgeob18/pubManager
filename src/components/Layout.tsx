import React from 'react';
import { Users, FileText, Settings, Menu, X } from 'lucide-react';
import { useSettings } from '../hooks/useData';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { settings } = useSettings();

  const navItems = [
    { id: 'directory', label: 'Directorio', icon: Users },
    { id: 'report', label: 'Informe Mensual', icon: FileText },
    { id: 'credits', label: 'Créditos', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{settings?.appName || 'PubManager'}</h1>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md md:block hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-blue-800 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <nav className="bg-white shadow-md md:hidden">
          <div className="px-4 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-800 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;