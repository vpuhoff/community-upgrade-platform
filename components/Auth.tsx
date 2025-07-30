import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RefreshCw, User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { projectId as supabaseProjectId, publicAnonKey } from '../utils/supabase/info';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onCancel: () => void;
}

export function Auth({ onAuthSuccess, onCancel }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      alert('Заполните все поля');
      return;
    }

    try {
      setLoading(true);
      
      // В реальном приложении здесь будет вызов Supabase Auth
      // Для демо имитируем успешную авторизацию
      const mockUser = {
        id: 'demo-user-id',
        email: signInData.email,
        name: 'Демо пользователь'
      };
      
      setTimeout(() => {
        onAuthSuccess(mockUser);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Ошибка входа в систему');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      alert('Заполните все поля');
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`https://${supabaseProjectId}.supabase.co/functions/v1/make-server-23919f8e/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка регистрации');
      }

      const result = await response.json();
      alert(result.message);
      
      // Переключаемся на вкладку входа
      setActiveTab('signin');
      setSignInData({
        email: signUpData.email,
        password: ''
      });
      
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Вход в CommunityUpgrade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signin-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ваш пароль"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ваше имя"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signup-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Придумайте пароль"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signup-confirm">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Повторите пароль"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Регистрация...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              Продолжить без регистрации
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Для полного доступа к функциям платформы рекомендуется регистрация</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}