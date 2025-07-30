import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, MapPin, Target, Calendar, FileText, RefreshCw } from 'lucide-react';
import { projectId as supabaseProjectId, publicAnonKey } from '../utils/supabase/info';

interface CreateProjectProps {
  onCancel: () => void;
  onAuthRequired?: () => void;
}

interface ProjectStage {
  id: string;
  name: string;
  description: string;
  amount: string;
}

export function CreateProject({ onCancel }: CreateProjectProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    targetAmount: '',
    deadline: '',
    image: ''
  });

  const [stages, setStages] = useState<ProjectStage[]>([
    { id: '1', name: '', description: '', amount: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'children', label: 'Детские проекты' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'parks', label: 'Парки и скверы' },
    { value: 'sports', label: 'Спорт' },
    { value: 'infrastructure', label: 'Инфраструктура' },
    { value: 'culture', label: 'Культура' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStage = () => {
    const newStage: ProjectStage = {
      id: Date.now().toString(),
      name: '',
      description: '',
      amount: ''
    };
    setStages(prev => [...prev, newStage]);
  };

  const removeStage = (stageId: string) => {
    if (stages.length > 1) {
      setStages(prev => prev.filter(stage => stage.id !== stageId));
    }
  };

  const updateStage = (stageId: string, field: string, value: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, [field]: value } : stage
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setSubmitting(true);

      // В реальном приложении здесь должна быть аутентификация
      // Для демо используем фиктивный токен
      const demoToken = 'demo-user-token';

      const projectData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        stages: stages.map(stage => ({
          ...stage,
          amount: parseFloat(stage.amount)
        }))
      };

      const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-23919f8e/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${demoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания проекта');
      }

      const result = await response.json();
      alert(result.message);
      onCancel();
    } catch (err) {
      console.error('Error creating project:', err);
      alert(err instanceof Error ? err.message : 'Ошибка создания проекта');
    } finally {
      setSubmitting(false);
    }
  };

  const totalStagesAmount = stages.reduce((sum, stage) => {
    return sum + (parseFloat(stage.amount) || 0);
  }, 0);

  const isFormValid = formData.title && formData.description && formData.location && 
                     formData.category && formData.targetAmount && formData.deadline &&
                     stages.every(stage => stage.name && stage.amount);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="mb-4 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Button>
        
        <h1>Создать новый проект</h1>
        <p className="text-muted-foreground">
          Расскажите о своей идее по улучшению района. Проект будет рассмотрен администрацией.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Основная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Название проекта *</Label>
                <Input
                  id="title"
                  placeholder="Например: Детская площадка на Садовой"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание проекта *</Label>
                <Textarea
                  id="description"
                  placeholder="Подробно опишите, что планируется сделать, зачем это нужно и как это улучшит жизнь района..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Местоположение *</Label>
                  <Input
                    id="location"
                    placeholder="Адрес или описание места"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Общий бюджет (₽) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="500000"
                    value={formData.targetAmount}
                    onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Планируемая дата завершения *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Изображение проекта</Label>
                <Input
                  id="image"
                  placeholder="Ссылка на изображение (необязательно)"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Этапы проекта */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Этапы проекта</span>
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addStage}>
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить этап
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4>Этап {index + 1}</h4>
                    {stages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(stage.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Название этапа"
                      value={stage.name}
                      onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                    />
                    
                    <Textarea
                      placeholder="Описание этапа"
                      value={stage.description}
                      onChange={(e) => updateStage(stage.id, 'description', e.target.value)}
                      rows={2}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Бюджет этапа (₽)"
                      value={stage.amount}
                      onChange={(e) => updateStage(stage.id, 'amount', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              {totalStagesAmount > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    Общая сумма этапов: <span className="font-medium">{totalStagesAmount.toLocaleString()}₽</span>
                    {formData.targetAmount && totalStagesAmount !== parseFloat(formData.targetAmount) && (
                      <span className="text-destructive ml-2">
                        (не совпадает с общим бюджетом)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Предварительный просмотр</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.image && (
                <img 
                  src={formData.image} 
                  alt="Предварительный просмотр"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              
              <div className="space-y-2">
                <h3>{formData.title || 'Название проекта'}</h3>
                
                {formData.location && (
                  <p className="text-sm text-muted-foreground flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{formData.location}</span>
                  </p>
                )}
                
                {formData.category && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.value === formData.category)?.label}
                  </Badge>
                )}
                
                {formData.targetAmount && (
                  <p className="text-sm">
                    <span className="font-medium">Цель:</span> {parseFloat(formData.targetAmount).toLocaleString()}₽
                  </p>
                )}
                
                {formData.deadline && (
                  <p className="text-sm flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>до {new Date(formData.deadline).toLocaleDateString('ru-RU')}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Важная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Все проекты проходят модерацию</p>
              <p>• Рассмотрение занимает до 24 часов</p>
              <p>• После одобрения проект появится на карте</p>
              <p>• Вы получите уведомление о статусе</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={!isFormValid || submitting}>
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Создаём проект...
                </>
              ) : (
                'Создать проект'
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={submitting}>
              Отмена
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}