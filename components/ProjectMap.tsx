import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, RefreshCw } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { ProjectMapSidebar } from './ProjectMapSidebar';
import { fetchProjects } from '../utils/projectsApi';
import { demoProjects, Project } from '../data/demoProjects';

interface ProjectMapProps {
  onProjectSelect: (projectId: string) => void;
}

export function ProjectMap({ onProjectSelect }: ProjectMapProps) {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Загрузка проектов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Карта */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Карта проектов</span>
                </div>
                <Button variant="outline" size="sm" onClick={loadProjects}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <InteractiveMap projects={projects} onProjectSelect={onProjectSelect} />
            </CardContent>
          </Card>
        </div>

        {/* Список проектов */}
        <ProjectMapSidebar projects={projects} onProjectSelect={onProjectSelect} />
      </div>
    </div>
  );
}