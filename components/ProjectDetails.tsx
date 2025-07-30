import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, Heart, Share2, MapPin, Users, Target, Calendar, MessageCircle, ThumbsUp, RefreshCw } from 'lucide-react';
import { fetchProjectById } from '../utils/projectDetailsApi';
import { Project } from '../data/demoProjects';
import { projectId as supabaseProjectId, publicAnonKey } from '../utils/supabase/info';

interface ProjectDetailsProps {
  projectId: string | null;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donating, setDonating] = useState(false);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);

      const projectData = await fetchProjectById(projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        setError('Проект не найден');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  if (!projectId) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к карте
        </Button>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Загрузка проекта...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к карте
        </Button>
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-destructive mb-4">{error || 'Проект не найден'}</p>
            <Button onClick={loadProject}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (project.currentAmount / project.targetAmount) * 100;
  const remainingAmount = project.targetAmount - project.currentAmount;

  const handleDonate = async () => {
    if (!donationAmount || !project) return;

    // Валидация на клиенте
    const numericAmount = parseFloat(donationAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Пожалуйста, введите корректную сумму пожертвования');
      return;
    }

    if (numericAmount > 1000000) {
      alert('Максимальная сумма пожертвования: 1,000,000₽');
      return;
    }

    try {
      setDonating(true);
      
      console.log('Making donation:', {
        projectId: project.id,
        amount: numericAmount,
        anonymous: isAnonymous
      });

      const demoToken = 'demo-user-token';
      
      const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-23919f8e/projects/${project.id}/donate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${demoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: numericAmount,
          anonymous: isAnonymous
        })
      });

      console.log('Donation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Donation error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
        throw new Error(errorData.error || 'Ошибка при пожертвовании');
      }

      const result = await response.json();
      console.log('Donation successful:', result);
      
      // Обновляем состояние проекта
      setProject(prev => prev ? {
        ...prev,
        currentAmount: result.project.currentAmount,
        donorsCount: result.project.donorsCount
      } : null);
      
      setDonationAmount('');
      
      // Показываем успешное сообщение
      alert(`${result.message}\n\nВаше пожертвование: ${numericAmount.toLocaleString()}₽\nОбщая сумма: ${result.project.currentAmount.toLocaleString()}₽`);
      
    } catch (err) {
      console.error('Error making donation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при пожертвовании';
      alert(`Не удалось обработать пожертвование:\n${errorMessage}`);
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4 flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад к карте</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="mb-2">{project.title}</h1>
                    <p className="text-muted-foreground flex items-center space-x-1 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </p>
                    <Badge>{project.status === 'active' ? 'Активен' : 'Завершен'}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{project.description}</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Собрано {project.currentAmount.toLocaleString()}₽ из {project.targetAmount.toLocaleString()}₽</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{project.donorsCount} спонсоров</span>
                    </span>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-3" />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progressPercentage.toFixed(1)}% собрано</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>до {project.deadline ? new Date(project.deadline).toLocaleDateString('ru-RU') : 'не указано'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="stages" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stages">Этапы</TabsTrigger>
              <TabsTrigger value="comments">Комментарии</TabsTrigger>
              <TabsTrigger value="updates">Обновления</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stages" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о проекте</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4>Текущий прогресс</h4>
                      <div className="mt-2">
                        <Progress value={progressPercentage} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.currentAmount.toLocaleString()}₽ из {project.targetAmount.toLocaleString()}₽
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4>Статус</h4>
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                        {project.status === 'completed' ? 'Завершен' : 'Активен'}
                      </Badge>
                    </div>
                    {project.category && (
                      <div>
                        <h4>Категория</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.category === 'children' ? 'Детская инфраструктура' :
                           project.category === 'transport' ? 'Транспорт' :
                           project.category === 'parks' ? 'Парки и скверы' : project.category}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Комментарии ({project.comments?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.comments && project.comments.length > 0 ? project.comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{comment.text}</p>
                          <Button variant="ghost" size="sm" className="text-xs">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      Комментариев пока нет. Будьте первым!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="updates" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Обновления проекта</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.updates && project.updates.length > 0 ? project.updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-primary pl-4">
                      <h4>{update.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{update.text}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      Обновлений пока нет
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Поддержать проект</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {remainingAmount.toLocaleString()}₽
                </p>
                <p className="text-sm text-muted-foreground">осталось собрать</p>
              </div>

              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Сумма пожертвования (₽)"
                  value={donationAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Разрешаем только числа и одну десятичную точку
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setDonationAmount(value);
                    }
                  }}
                  min="1"
                  max="1000000"
                  step="1"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationAmount(amount.toString())}
                      className="text-xs"
                    >
                      {amount.toLocaleString()}₽
                    </Button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                    Анонимное пожертвование
                  </label>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleDonate}
                  disabled={!donationAmount || donating || project.status !== 'active'}
                >
                  {donating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Обрабатываем...
                    </>
                  ) : (
                    'Поддержать проект'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}