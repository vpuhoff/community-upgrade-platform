import { projectId as supabaseProjectId, publicAnonKey } from './supabase/info';
import { demoProjects, Project } from '../data/demoProjects';

export async function fetchProjects(): Promise<Project[]> {
  try {
    console.log('Fetching projects...');

    const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-23919f8e/projects`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    console.log('Projects response status:', response.status);

    if (!response.ok) {
      console.log('Server request failed, using demo data');
      return demoProjects;
    }

    const data = await response.json();
    console.log('Projects data:', data);
    
    // Если данные получены с сервера, но нет координат, добавляем их из демо-данных
    const projectsWithCoords = data.map((project: any) => {
      const demoProject = demoProjects.find(demo => demo.id === project.id);
      return {
        ...project,
        latitude: project.latitude || demoProject?.latitude || 55.7558,
        longitude: project.longitude || demoProject?.longitude || 37.6176,
        comments: project.comments || demoProject?.comments || [],
        updates: project.updates || demoProject?.updates || []
      };
    });
    
    return projectsWithCoords;
  } catch (err) {
    console.error('Error fetching projects:', err);
    console.log('Using demo data due to error');
    return demoProjects;
  }
}