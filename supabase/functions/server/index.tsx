import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Регистрация нового пользователя
app.post('/make-server-23919f8e/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Error creating user:', error)
      return c.json({ error: error.message }, 400)
    }

    // Создаем профиль пользователя
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      level: 1,
      experience: 0,
      totalDonated: 0,
      projectsSupported: 0,
      projectsCreated: 0,
      joinDate: new Date().toISOString(),
      badges: []
    })

    return c.json({ 
      user: data.user,
      message: 'Пользователь успешно зарегистрирован' 
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Ошибка регистрации' }, 500)
  }
})

// Получение профиля пользователя
app.get('/make-server-23919f8e/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Не авторизован' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Пользователь не найден' }, 401)
    }

    const profile = await kv.get(`user:${user.id}`)
    if (!profile) {
      return c.json({ error: 'Профиль не найден' }, 404)
    }

    return c.json(profile)
  } catch (error) {
    console.log('Error getting user profile:', error)
    return c.json({ error: 'Ошибка получения профиля' }, 500)
  }
})

// Создание нового проекта
app.post('/make-server-23919f8e/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Не авторизован' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Пользователь не найден' }, 401)
    }

    const projectData = await c.req.json()
    const projectId = crypto.randomUUID()
    
    const project = {
      id: projectId,
      ...projectData,
      creatorId: user.id,
      currentAmount: 0,
      donorsCount: 0,
      status: 'pending', // Требует модерации
      createdAt: new Date().toISOString(),
      comments: [],
      updates: []
    }

    await kv.set(`project:${projectId}`, project)
    
    // Добавляем в список всех проектов
    const allProjects = await kv.get('all_projects') || []
    allProjects.push(projectId)
    await kv.set('all_projects', allProjects)

    // Обновляем статистику пользователя
    const userProfile = await kv.get(`user:${user.id}`)
    if (userProfile) {
      userProfile.projectsCreated += 1
      userProfile.experience += 100 // Опыт за создание проекта
      await kv.set(`user:${user.id}`, userProfile)
    }

    return c.json({ 
      project,
      message: 'Проект создан и отправлен на модерацию' 
    })
  } catch (error) {
    console.log('Error creating project:', error)
    return c.json({ error: 'Ошибка создания проекта' }, 500)
  }
})

// Получение всех проектов
app.get('/make-server-23919f8e/projects', async (c) => {
  try {
    console.log('Getting all projects...')
    
    // Начинаем с хардкодированных демо-проектов
    const demoProjects = getAllDemoProjects()
    console.log('Demo projects loaded:', demoProjects.length)
    
    // Пытаемся получить дополнительные проекты из KV store
    let additionalProjects = []
    try {
      const allProjectIds = await kv.get('all_projects') || []
      console.log('Additional project IDs from KV:', allProjectIds)
      
      for (const projectId of allProjectIds) {
        // Пропускаем демо-проекты, которые уже есть
        if (!DEMO_PROJECTS[projectId]) {
          const project = await kv.get(`project:${projectId}`)
          if (project) {
            additionalProjects.push(project)
          }
        }
      }
    } catch (kvError) {
      console.log('KV store error when getting additional projects:', kvError)
      // Игнорируем ошибки KV store и продолжаем только с демо-данными
    }
    
    const allProjects = [...demoProjects, ...additionalProjects]
    console.log('Returning total projects:', allProjects.length)
    return c.json(allProjects)
  } catch (error) {
    console.log('Error getting projects:', error)
    return c.json({ error: 'Ошибка получения проектов' }, 500)
  }
})

// Получение конкретного проекта
app.get('/make-server-23919f8e/projects/:id', async (c) => {
  try {
    const projectId = c.req.param('id')
    console.log('Fetching project with ID:', projectId)
    
    // Сначала проверяем хардкодированные демо-данные
    const demoProject = getDemoProject(projectId)
    if (demoProject) {
      console.log('Found demo project:', projectId)
      return c.json(demoProject)
    }
    
    // Если не найден в демо-данных, проверяем KV store
    try {
      const project = await kv.get(`project:${projectId}`)
      if (project) {
        console.log('Found project in KV store:', projectId)
        return c.json(project)
      }
    } catch (kvError) {
      console.log('KV store error:', kvError)
      // Игнорируем ошибки KV store и продолжаем
    }
    
    console.log('Project not found:', projectId)
    return c.json({ error: 'Проект не найден' }, 404)
  } catch (error) {
    console.log('Error getting project:', error)
    return c.json({ error: 'Ошибка получения проекта' }, 500)
  }
})

// Пожертвование на проект
app.post('/make-server-23919f8e/projects/:id/donate', async (c) => {
  try {
    const projectId = c.req.param('id')
    console.log('Processing donation for project:', projectId)

    // Получаем и валидируем данные запроса
    let requestData
    try {
      requestData = await c.req.json()
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      return c.json({ error: 'Некорректный формат данных' }, 400)
    }

    const { amount, anonymous = false } = requestData
    console.log('Donation details:', { amount, anonymous, type: typeof amount })

    // Валидируем сумму пожертвования
    if (!amount || amount === '' || amount === null || amount === undefined) {
      console.log('Amount is empty or null')
      return c.json({ error: 'Не указана сумма пожертвования' }, 400)
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('Invalid amount:', amount, 'parsed as:', numericAmount)
      return c.json({ error: 'Некорректная сумма пожертвования' }, 400)
    }

    if (numericAmount > 1000000) {
      console.log('Amount too large:', numericAmount)
      return c.json({ error: 'Сумма пожертвования слишком велика' }, 400)
    }

    // Проверяем, что проект существует
    const demoProject = getDemoProject(projectId)
    if (!demoProject) {
      console.log('Project not found:', projectId)
      return c.json({ error: 'Проект не найден' }, 404)
    }

    console.log('Found project:', demoProject.title, 'status:', demoProject.status)

    // Для демо-версии разрешаем пожертвования даже на завершенные проекты для тестирования
    if (demoProject.status !== 'active' && demoProject.status !== 'completed') {
      console.log('Project not active, status:', demoProject.status)
      return c.json({ error: 'Проект не доступен для пожертвований' }, 400)
    }

    // Имитируем обновление проекта
    const updatedAmount = Math.min(demoProject.currentAmount + numericAmount, demoProject.targetAmount)
    const updatedDonorsCount = demoProject.donorsCount + 1

    console.log('Donation processed successfully:', {
      originalAmount: demoProject.currentAmount,
      donationAmount: numericAmount,
      updatedAmount,
      updatedDonorsCount
    })

    return c.json({ 
      transaction: {
        id: crypto.randomUUID(),
        projectId,
        amount: numericAmount,
        anonymous,
        date: new Date().toISOString()
      },
      project: {
        id: projectId,
        currentAmount: updatedAmount,
        donorsCount: updatedDonorsCount
      },
      message: demoProject.status === 'completed' 
        ? 'Спасибо за поддержку завершенного проекта! (демо-версия)' 
        : 'Спасибо за пожертвование! (демо-версия)'
    })
  } catch (error) {
    console.log('Error processing donation:', error)
    return c.json({ 
      error: 'Ошибка обработки пожертвования', 
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, 500)
  }
})

// Добавление комментария к проекту
app.post('/make-server-23919f8e/projects/:id/comments', async (c) => {
  try {
    const projectId = c.req.param('id')
    const { text } = await c.req.json()

    console.log('Adding comment to project:', projectId)

    // Проверяем, что проект существует
    const demoProject = getDemoProject(projectId)
    if (!demoProject) {
      return c.json({ error: 'Проект не найден' }, 404)
    }

    // Для демо версии создаем комментарий от демо-пользователя
    const comment = {
      id: crypto.randomUUID(),
      author: 'Демо Пользователь',
      text,
      date: new Date().toISOString(),
      likes: 0,
      userId: 'demo-user'
    }

    return c.json({ 
      comment,
      message: 'Комментарий добавлен (демо-версия)' 
    })
  } catch (error) {
    console.log('Error adding comment:', error)
    return c.json({ error: 'Ошибка добавления комментария' }, 500)
  }
})

// Функция проверки новых бейджей
function checkForNewBadges(userProfile: any) {
  const newBadges = []
  const currentBadgeIds = userProfile.badges.map((b: any) => b.id)

  // Первый взнос
  if (userProfile.totalDonated > 0 && !currentBadgeIds.includes('first_donation')) {
    newBadges.push({
      id: 'first_donation',
      name: 'Первый взнос',
      description: 'Сделал первое пожертвование',
      earnedAt: new Date().toISOString()
    })
  }

  // Щедрый спонсор
  if (userProfile.totalDonated >= 10000 && !currentBadgeIds.includes('generous_sponsor')) {
    newBadges.push({
      id: 'generous_sponsor',
      name: 'Щедрый спонсор',
      description: 'Пожертвовал более 10,000₽',
      earnedAt: new Date().toISOString()
    })
  }

  // Активный участник
  if (userProfile.projectsSupported >= 10 && !currentBadgeIds.includes('active_participant')) {
    newBadges.push({
      id: 'active_participant',
      name: 'Активный участник',
      description: 'Поддержал 10+ проектов',
      earnedAt: new Date().toISOString()
    })
  }

  // Инициатор
  if (userProfile.projectsCreated > 0 && !currentBadgeIds.includes('initiator')) {
    newBadges.push({
      id: 'initiator',
      name: 'Инициатор',
      description: 'Создал свой проект',
      earnedAt: new Date().toISOString()
    })
  }

  // Мега-спонсор
  if (userProfile.totalDonated >= 50000 && !currentBadgeIds.includes('mega_sponsor')) {
    newBadges.push({
      id: 'mega_sponsor',
      name: 'Мега-спонсор',
      description: 'Пожертвовал более 50,000₽',
      earnedAt: new Date().toISOString()
    })
  }

  return newBadges
}

// Хардкодированные демо-данные как основной источник
const DEMO_PROJECTS: { [key: string]: any } = {
  '1': {
    id: '1',
    title: 'Детская площадка на Садовой',
    description: 'Проект по обновлению детской площадки включает установку современных безопасных игровых элементов, мягкое покрытие, новые скамейки для родителей и ограждение территории.',
    location: 'ул. Садовая, 15',
    targetAmount: 500000,
    currentAmount: 325000,
    donorsCount: 45,
    status: 'active',
    category: 'children',
    deadline: '2025-09-15',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop',
    creatorId: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
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
  '2': {
    id: '2',
    title: 'Велодорожка по набережной',
    description: 'Строительство безопасной велодорожки вдоль реки для безопасного передвижения велосипедистов и пешеходов.',
    location: 'Набережная реки Волга',
    targetAmount: 1200000,
    currentAmount: 890000,
    donorsCount: 127,
    status: 'active',
    category: 'transport',
    deadline: '2025-12-30',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    creatorId: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
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
  '3': {
    id: '3',
    title: 'Ремонт сквера Победы',
    description: 'Благоустройство сквера: новые скамейки, освещение, клумбы и обновление пешеходных дорожек.',
    location: 'Сквер Победы',
    targetAmount: 800000,
    currentAmount: 800000,
    donorsCount: 89,
    status: 'completed',
    category: 'parks',
    deadline: '2025-06-01',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=400&fit=crop',
    creatorId: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
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
}

// Функция получения демо-проекта по ID
function getDemoProject(id: string) {
  return DEMO_PROJECTS[id] || null
}

// Функция получения всех демо-проектов
function getAllDemoProjects() {
  return Object.values(DEMO_PROJECTS)
}

// Функция инициализации демо-данных (теперь опциональная)
async function initializeDemoData() {
  console.log('Initializing demo data in KV store...')
  
  try {
    const demoProjects = getAllDemoProjects()
    
    // Сохраняем демо-проекты в KV store как бэкап
    for (const project of demoProjects) {
      console.log('Saving project to KV:', project.id)
      await kv.set(`project:${project.id}`, project)
    }

    await kv.set('all_projects', ['1', '2', '3'])
    console.log('Demo data saved to KV store successfully')
  } catch (error) {
    console.log('Error saving to KV store (will continue with hardcoded data):', error)
    // Не прерываем выполнение, так как у нас есть хардкодированные данные
  }
}

// Инициализация демо-данных
app.post('/make-server-23919f8e/init-demo-data', async (c) => {
  try {
    console.log('Init demo data endpoint called')
    
    // Проверяем, что демо-данные доступны
    const demoProjects = getAllDemoProjects()
    console.log('Demo projects available:', demoProjects.length)
    
    // Опционально сохраняем в KV store
    await initializeDemoData()
    
    return c.json({ 
      message: 'Демо-данные доступны',
      projectsCount: demoProjects.length,
      projectIds: Object.keys(DEMO_PROJECTS)
    })
  } catch (error) {
    console.log('Error with demo data:', error)
    return c.json({ 
      message: 'Демо-данные доступны (с ограничениями)',
      projectsCount: Object.keys(DEMO_PROJECTS).length 
    })
  }
})

// Тестовый endpoint для проверки KV store
app.get('/make-server-23919f8e/test', async (c) => {
  try {
    // Тестируем KV store
    const testKey = 'test-key'
    const testValue = { message: 'Hello from KV store', timestamp: new Date().toISOString() }
    
    await kv.set(testKey, testValue)
    const retrieved = await kv.get(testKey)
    
    return c.json({
      message: 'KV store working',
      stored: testValue,
      retrieved: retrieved,
      match: JSON.stringify(testValue) === JSON.stringify(retrieved)
    })
  } catch (error) {
    console.log('Test error:', error)
    return c.json({ error: 'Test failed', details: error.message }, 500)
  }
})

Deno.serve(app.fetch)