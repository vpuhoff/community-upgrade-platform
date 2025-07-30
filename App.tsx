import React, { useState } from 'react';
import { Header } from './components/Header';
import { ProjectMap } from './components/ProjectMap';
import { ProjectsList } from './components/ProjectsList';
import { ProjectDetails } from './components/ProjectDetails';
import { UserProfile } from './components/UserProfile';
import { CreateProject } from './components/CreateProject';
import { Auth } from './components/Auth';

export default function App() {
  const [currentView, setCurrentView] = useState<'map' | 'projects' | 'profile' | 'create' | 'details'>('map');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('details');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleAuthRequired = () => {
    setShowAuth(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return <ProjectMap onProjectSelect={handleProjectSelect} />;
      case 'projects':
        return <ProjectsList onProjectSelect={handleProjectSelect} />;
      case 'profile':
        return <UserProfile />;
      case 'create':
        return <CreateProject onCancel={() => setCurrentView('map')} onAuthRequired={handleAuthRequired} />;
      case 'details':
        return <ProjectDetails projectId={selectedProjectId} onBack={() => setCurrentView('map')} />;
      default:
        return <ProjectMap onProjectSelect={handleProjectSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView}
        user={user}
        onAuthRequired={handleAuthRequired}
      />
      <main>
        {renderCurrentView()}
      </main>
      
      {showAuth && (
        <Auth 
          onAuthSuccess={handleAuthSuccess}
          onCancel={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}