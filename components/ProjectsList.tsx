import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Search, Filter, MapPin, Users, Target, Calendar } from 'lucide-react';

const mockProjects = [
  {
    id: '1',
    title: 'Детская площадка на Садовой',
    description: 'Обновление детской площадки с новыми безопасными элементами',
    location: 'ул. Садовая, 15',
    targetAmount: 500000,
    currentAmount: 325000,
    donorsCount: 45,
    status: 'active',
    category: 'children',
    deadline: '2025-09-15',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Велодорожка по набережной',
    description: 'Строительство безопасной велодорожки вдоль реки',
    location: 'Набережная реки Волга',
    targetAmount: 1200000,
    currentAmount: 890000,
    donorsCount: 127,
    status: 'active',
    category: 'transport',
    deadline: '2025-12-30',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'Ремонт сквера Победы',
    description: 'Благоустройство сквера: новые скамейки, освещение, клумбы',
    location: 'Сквер Победы',
    targetAmount: 800000,
    currentAmount: 800000,
    donorsCount: 89,
    status: 'completed',
    category: 'parks',
    deadline: '2025-06-01',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=200&fit=crop'
  },
  {
    id: '4',
    title: 'Спортивная площадка в микрорайоне',
    description: 'Установка современных тренажеров и беговых дорожек',
    location: 'мкр. Солнечный',
    targetAmount: 750000,
    currentAmount: 125000,
    donorsCount: 23,
    status: 'active',
    category: 'sports',
    deadline: '2025-10-15',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop'
  },
  {
    id: '5',
    title: 'Освещение пешеходных дорожек',
    description: 'Установка LED-освещения для безопасности пешеходов',
    location: 'Центральный район',
    targetAmount: 600000,
    currentAmount: 450000,
    donorsCount: 67,
    status: 'active',
    category: 'infrastructure',
    deadline: '2025-08-20',
    image: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=400&h=200&fit=crop'
  }
];

interface ProjectsListProps {
  onProjectSelect: (projectId: string) => void;
}

export function ProjectsList({ onProjectSelect }: ProjectsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'children', label: 'Детские' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'parks', label: 'Парки и скверы' },
    { value: 'sports', label: 'Спорт' },
    { value: 'infrastructure', label: 'Инфраструктура' }
  ];

  const statuses = [
    { value: 'all', label: 'Все проекты' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Завершенные' }
  ];

  const sortOptions = [
    { value: 'progress', label: 'По прогрессу' },
    { value: 'amount', label: 'По сумме' },
    { value: 'donors', label: 'По количеству спонсоров' },
    { value: 'deadline', label: 'По дедлайну' }
  ];

  const filteredProjects = mockProjects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
        case 'amount':
          return b.currentAmount - a.currentAmount;
        case 'donors':
          return b.donorsCount - a.donorsCount;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-4">Все проекты</h1>
        
        {/* Фильтры и поиск */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{filteredProjects.length}</p>
            <p className="text-sm text-muted-foreground">Проектов найдено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {filteredProjects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {filteredProjects.reduce((sum, p) => sum + p.currentAmount, 0).toLocaleString()}₽
            </p>
            <p className="text-sm text-muted-foreground">Собрано всего</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {filteredProjects.reduce((sum, p) => sum + p.donorsCount, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Всего спонсоров</p>
          </CardContent>
        </Card>
      </div>

      {/* Список проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const progressPercentage = (project.currentAmount / project.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onProjectSelect(project.id)}
            >
              <CardContent className="p-0">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium line-clamp-2 flex-1 mr-2">{project.title}</h3>
                    <Badge 
                      variant={project.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {project.status === 'completed' ? 'Завершен' : 'Активен'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <p className="text-sm text-muted-foreground flex items-center space-x-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{project.location}</span>
                  </p>
                  
                  <div className="space-y-3">
                    <Progress value={progressPercentage} className="h-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{(project.currentAmount / 1000).toFixed(0)}к из {(project.targetAmount / 1000).toFixed(0)}к ₽</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{project.donorsCount}</span>
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{progressPercentage.toFixed(1)}% собрано</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {daysLeft > 0 ? `${daysLeft} дн.` : 'Завершен'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3>Проекты не найдены</h3>
          <p className="text-muted-foreground">Попробуйте изменить критерии поиска</p>
        </div>
      )}
    </div>
  );
}