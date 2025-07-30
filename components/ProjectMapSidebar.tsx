import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Users, Target } from 'lucide-react';
import { Project } from '../data/demoProjects';

interface ProjectMapSidebarProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
}

export function ProjectMapSidebar({ projects, onProjectSelect }: ProjectMapSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Активные проекты</h2>
        <Badge variant="secondary">{projects.length}</Badge>
      </div>
      {projects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onProjectSelect(project.id)}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1 truncate">{project.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2">
                  <Progress value={(project.currentAmount / project.targetAmount) * 100} className="h-1.5" />
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{(project.currentAmount / 1000).toFixed(0)}к из {(project.targetAmount / 1000).toFixed(0)}к ₽</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{project.donorsCount}</span>
                    </span>
                  </div>
                </div>
                
                <Badge 
                  variant={project.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs mt-2"
                >
                  {project.status === 'completed' ? 'Завершен' : 'Активен'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}