import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Star, Trophy, Heart, Target, TrendingUp, Award, Users, Calendar } from 'lucide-react';

const mockUserData = {
  name: 'Анна Петрова',
  email: 'anna.petrova@example.com',
  level: 5,
  experience: 2750,
  nextLevelExp: 3000,
  totalDonated: 45000,
  projectsSupported: 12,
  projectsCreated: 2,
  joinDate: '2024-03-15',
  badges: [
    { id: 1, name: 'Первый взнос', description: 'Сделал первое пожертвование', icon: 'Heart', earned: true },
    { id: 2, name: 'Щедрый спонсор', description: 'Пожертвовал более 10,000₽', icon: 'Trophy', earned: true },
    { id: 3, name: 'Активный участник', description: 'Поддержал 10+ проектов', icon: 'Users', earned: true },
    { id: 4, name: 'Инициатор', description: 'Создал свой проект', icon: 'Target', earned: true },
    { id: 5, name: 'Мега-спонсор', description: 'Пожертвовал более 50,000₽', icon: 'Award', earned: false },
    { id: 6, name: 'Амбассадор', description: 'Привлек 5+ новых участников', icon: 'Star', earned: false }
  ],
  recentActivity: [
    {
      id: 1,
      type: 'donation',
      description: 'Пожертвовал 5,000₽ на проект "Детская площадка на Садовой"',
      date: '2025-01-28',
      amount: 5000
    },
    {
      id: 2,
      type: 'comment',
      description: 'Оставил комментарий к проекту "Велодорожка по набережной"',
      date: '2025-01-25'
    },
    {
      id: 3,
      type: 'badge',
      description: 'Получил бейдж "Активный участник"',
      date: '2025-01-20'
    }
  ]
};

const IconComponents = {
  Heart,
  Trophy,
  Users,
  Target,
  Award,
  Star,
  TrendingUp
};

export function UserProfile() {
  const progressToNextLevel = (mockUserData.experience / mockUserData.nextLevelExp) * 100;
  const earnedBadges = mockUserData.badges.filter(badge => badge.earned);
  const upcomingBadges = mockUserData.badges.filter(badge => !badge.earned);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация профиля */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">АП</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1>{mockUserData.name}</h1>
                  <p className="text-muted-foreground">{mockUserData.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Уровень {mockUserData.level}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>С {new Date(mockUserData.joinDate).toLocaleDateString('ru-RU')}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Прогресс до следующего уровня</span>
                    <span className="text-sm text-muted-foreground">
                      {mockUserData.experience} / {mockUserData.nextLevelExp} XP
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{mockUserData.totalDonated.toLocaleString()}₽</p>
                    <p className="text-sm text-muted-foreground">Всего пожертвовано</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{mockUserData.projectsSupported}</p>
                    <p className="text-sm text-muted-foreground">Проектов поддержано</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{mockUserData.projectsCreated}</p>
                    <p className="text-sm text-muted-foreground">Проектов создано</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Недавняя активность */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Недавняя активность</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUserData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('ru-RU')}
                        {activity.amount && ` • ${activity.amount.toLocaleString()}₽`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель с бейджами */}
        <div className="space-y-6">
          {/* Полученные бейджи */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Бейджи ({earnedBadges.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {earnedBadges.map((badge) => {
                  const IconComponent = IconComponents[badge.icon as keyof typeof IconComponents];
                  return (
                    <div key={badge.id} className="flex flex-col items-center text-center p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mb-2">
                        <IconComponent className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h4 className="text-sm font-medium mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Доступные бейджи */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Доступные бейджи</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBadges.map((badge) => {
                  const IconComponent = IconComponents[badge.icon as keyof typeof IconComponents];
                  return (
                    <div key={badge.id} className="flex items-center space-x-3 p-2 border rounded-lg opacity-60">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Достижения */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Место в рейтинге</span>
                <span className="font-medium">#23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Дней активности</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Средний взнос</span>
                <span className="font-medium">3,750₽</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}