export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  targetAmount: number;
  currentAmount: number;
  donorsCount: number;
  status: string;
  category?: string;
  deadline?: string;
  image?: string;
  comments?: Array<{
    id: string;
    author: string;
    text: string;
    date: string;
    likes: number;
  }>;
  updates?: Array<{
    id: string;
    title: string;
    text: string;
    date: string;
  }>;
}

export const demoProjects: Project[] = [
  {
    id: '1',
    title: 'Детская площадка на Садовой',
    description: 'Проект по обновлению детской площадки включает установку современных безопасных игровых элементов, мягкое покрытие, новые скамейки для родителей и ограждение территории.',
    location: 'ул. Садовая, 15',
    latitude: 55.7558,
    longitude: 37.6176,
    targetAmount: 500000,
    currentAmount: 325000,
    donorsCount: 45,
    status: 'active',
    category: 'children',
    deadline: '2025-09-15',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop',
    comments: [
      {
        id: '1',
        author: 'Анна М.',
        text: 'Отличная инициатива! Нашим детям очень нужна новая площадка.',
        date: '2025-01-20T00:00:00Z',
        likes: 12
      },
      {
        id: '2',
        author: 'Дмитрий К.',
        text: 'Вложил 5000₽. Когда планируется начало работ?',
        date: '2025-01-18T00:00:00Z',
        likes: 8
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Проект запущен',
        text: 'Проект успешно запущен и открыт для сбора средств.',
        date: '2025-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Велодорожка по набережной',
    description: 'Строительство безопасной велодорожки вдоль реки для безопасного передвижения велосипедистов и пешеходов.',
    location: 'Набережная реки Волга',
    latitude: 59.9311,
    longitude: 30.3609,
    targetAmount: 1200000,
    currentAmount: 890000,
    donorsCount: 127,
    status: 'active',
    category: 'transport',
    deadline: '2025-12-30',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    comments: [
      {
        id: '1',
        author: 'Михаил С.',
        text: 'Давно пора сделать нормальную велодорожку! Поддерживаю.',
        date: '2025-01-22T00:00:00Z',
        likes: 15
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Получено разрешение',
        text: 'Получены все необходимые разрешения от городской администрации.',
        date: '2025-01-10T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Ремонт сквера Победы',
    description: 'Благоустройство сквера: новые скамейки, освещение, клумбы и обновление пешеходных дорожек.',
    location: 'Сквер Победы',
    latitude: 55.0084,
    longitude: 82.9357,
    targetAmount: 800000,
    currentAmount: 800000,
    donorsCount: 89,
    status: 'completed',
    category: 'parks',
    deadline: '2025-06-01',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=400&fit=crop',
    comments: [
      {
        id: '1',
        author: 'Елена В.',
        text: 'Замечательно! Сквер теперь выглядит прекрасно.',
        date: '2025-06-05T00:00:00Z',
        likes: 23
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Проект завершен',
        text: 'Благоустройство сквера успешно завершено. Спасибо всем участникам!',
        date: '2025-06-01T00:00:00Z'
      }
    ]
  }
];