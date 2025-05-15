// Highlights List Page 
import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import HighlightManager from '../../components/dashboard/HighlightManager';

const HighlightList: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Highlights</h1>
          </div>
        </header>
        
        <main>
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <HighlightManager />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HighlightList; 