import React, { useRef, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Project } from '../data/demoProjects';

interface InteractiveMapProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
}

export function InteractiveMap({ projects, onProjectSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeMap = async () => {
    if (!mapRef.current || mapLoaded || isInitializing) {
      console.log('Map initialization skipped:', {
        hasMapRef: !!mapRef.current,
        mapLoaded,
        isInitializing
      });
      return;
    }

    setIsInitializing(true);
    console.log('Starting map initialization...');

    try {
      // Дополнительная проверка что элемент действительно в DOM
      if (!mapRef.current.isConnected) {
        console.log('Map container not in DOM yet');
        setIsInitializing(false);
        return;
      }

      // Очищаем предыдущую карту если есть
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      // Загружаем Leaflet динамически
      console.log('Loading Leaflet library...');
      const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
      
      // Загружаем CSS для Leaflet если еще не загружен
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkElement);
        
        // Ждем загрузки CSS
        await new Promise((resolve) => {
          linkElement.onload = resolve;
          setTimeout(resolve, 1000); // fallback timeout
        });
      }

      console.log('Creating map instance...');
      
      // Создаем карту с дополнительными опциями
      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([55.7558, 37.6176], 5);

      console.log('Map instance created, adding tile layer...');

      // Добавляем тайлы OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      console.log('Tile layer added, creating markers...');

      // Создаем кастомную иконку
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #030213; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                 </svg>
               </div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 25]
      });

      // Добавляем маркеры для каждого проекта
      console.log('Adding markers for projects:', projects.length);
      
      projects.forEach((project, index) => {
        try {
          const marker = L.marker([project.latitude, project.longitude], { icon: customIcon })
            .addTo(map);

          const progressPercent = (project.currentAmount / project.targetAmount) * 100;
          const statusText = project.status === 'completed' ? 'Завершен' : 'Активен';
          const statusColor = project.status === 'completed' ? '#22c55e' : '#3b82f6';

          marker.bindPopup(`
            <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
              <img src="${project.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.style.display='none'" />
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px; line-height: 1.4;">${project.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">${project.description}</p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888; display: flex; align-items: center;">
                <span style="margin-right: 4px;">📍</span> ${project.location}
              </p>
              
              <div style="margin: 8px 0;">
                <div style="background: #f0f0f0; height: 4px; border-radius: 2px; overflow: hidden;">
                  <div style="background: ${statusColor}; height: 100%; width: ${Math.min(progressPercent, 100)}%; transition: width 0.3s;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 11px;">
                  <span>💰 ${(project.currentAmount / 1000).toFixed(0)}к из ${(project.targetAmount / 1000).toFixed(0)}к ₽</span>
                  <span>👥 ${project.donorsCount}</span>
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">${statusText}</span>
                <button 
                  onclick="if(window.selectProject) window.selectProject('${project.id}')" 
                  style="background: #030213; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: background 0.2s;"
                  onmouseover="this.style.background='#1a1a2e'"
                  onmouseout="this.style.background='#030213'"
                >
                  Подробнее
                </button>
              </div>
            </div>
          `, {
            maxWidth: 250,
            className: 'custom-popup'
          });

          console.log(`Marker ${index + 1} added for project ${project.id}`);
        } catch (markerError) {
          console.error(`Error creating marker for project ${project.id}:`, markerError);
        }
      });

      // Делаем функцию выбора проекта глобально доступной
      (window as any).selectProject = onProjectSelect;

      // Сохраняем ссылку на карту
      leafletMapRef.current = map;
      setMapLoaded(true);
      setError(null);
      console.log('Map initialization completed successfully');

    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Ошибка загрузки карты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (projects.length > 0 && mapRef.current) {
      // Добавляем небольшую задержку для уверенности что DOM готов
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [projects]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-b-lg"
        style={{ minHeight: '500px' }}
      >
        {!mapLoaded && !error && (
          <div className="w-full h-full bg-muted rounded-b-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">
                {isInitializing ? 'Инициализация карты...' : 'Загрузка карты...'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="absolute inset-0 bg-card/90 flex items-center justify-center rounded-b-lg">
          <div className="text-center p-4">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-destructive" />
            <p className="text-destructive mb-4 text-sm max-w-xs">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setMapLoaded(false);
                setTimeout(initializeMap, 100);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      )}
    </div>
  );
}