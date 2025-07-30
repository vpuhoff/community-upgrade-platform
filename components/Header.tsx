import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Map, List, User, Plus, Bell } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'map' | 'projects' | 'profile' | 'create') => void;
  user?: any;
  onAuthRequired: () => void;
}

export function Header({ currentView, onNavigate, user, onAuthRequired }: HeaderProps) {
  const handleAuthRequiredAction = (action: () => void) => {
    if (!user) {
      onAuthRequired();
    } else {
      action();
    }
  };
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-primary">CommunityUpgrade</h1>
            <Badge variant="secondary" className="text-xs">
              Бета
            </Badge>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('map')}
              className="flex items-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Карта</span>
            </Button>
            
            <Button
              variant={currentView === 'projects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('projects')}
              className="flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>Проекты</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAuthRequiredAction(() => onNavigate('create'))}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Создать</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 relative"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            
            {user ? (
              <Button
                variant={currentView === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>{user.name || 'Профиль'}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAuthRequired}
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Войти</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}