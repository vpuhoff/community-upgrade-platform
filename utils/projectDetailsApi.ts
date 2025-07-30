import { projectId as supabaseProjectId, publicAnonKey } from './supabase/info';
import { demoProjects, Project } from '../data/demoProjects';

export async function fetchProjectById(projectId: string): Promise<Project | null> {
  try {
    console.log('Fetching project with ID:', projectId);

    // Прямой запрос к серверу
    const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-23919f8e/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    console.log('Project response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Project error:', errorText);
      
      // Fallback к локальным данным
      console.log('Server request failed, trying local demo data');
      const localProject = demoProjects.find(p => p.id === projectId);
      if (localProject) {
        console.log('Found project in local demo data:', projectId);
        return localProject;
      }
      
      throw new Error(`Ошибка загрузки проекта: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Project data:', data);
    return data;
  } catch (err) {
    console.error('Error fetching project:', err);
    
    // Последний fallback к локальным данным
    console.log('Trying fallback to local demo data');
    const localProject = demoProjects.find(p => p.id === projectId);
    if (localProject) {
      console.log('Found project in local demo data (fallback):', projectId);
      return localProject;
    }
    
    // Если не найден даже в локальных данных, возвращаем null
    return null;
  }
}