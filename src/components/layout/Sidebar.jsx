// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  ArchiveBoxIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { currentUser, isAdmin } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Products', path: '/products', icon: CubeIcon },
    { name: 'Inventory', path: '/inventory', icon: ArchiveBoxIcon },
    { name: 'Reports', path: '/reports', icon: DocumentChartBarIcon },
    ...(isAdmin ? [{ name: 'Settings', path: '/settings', icon: Cog6ToothIcon }] : [])
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-md fixed left-0 top-0 p-4">
      <div className="flex items-center space-x-2 mb-8 p-2">
        <CubeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          BeautyStock
        </h1>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {currentUser && (
        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center w-full p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}