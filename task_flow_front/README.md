# 🚀 TaskFlow Frontend

Современное React-приложение для управления задачами в стиле Kanban с real-time синхронизацией.

## ✨ Возможности

- 📋 **Kanban доски** - создание и управление досками с колонками
- 🎯 **Задачи** - создание, редактирование, перетаскивание (drag-and-drop)
- 👥 **Совместная работа** - приглашение участников, назначение исполнителей(в разработке)
- 🔄 **Real-time синхронизация** - WebSocket subscriptions через GraphQL
- 💬 **Комментарии** - обсуждение задач в реальном времени(в разработке)
- 🏷️ **Метки и приоритеты** - организация и фильтрация задач
- 📅 **Сроки** - установка дедлайнов для задач
- 🎨 **Современный UI** - минималистичный дизайн с Tailwind CSS
- ⚡ **Оптимистичные обновления** - мгновенный отклик интерфейса

## 🛠️ Технологический стек

### Core

- **React** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер

### State Management

- **Zustand** - глобальное состояние (auth, UI)
- **Apollo Client** - GraphQL клиент + cache

### GraphQL & Real-time

- **@apollo/client** - GraphQL запросы, мутации, subscriptions
- **graphql-ws** - WebSocket транспорт для subscriptions

### UI & Styling

- **Tailwind CSS** - utility-first CSS
- **shadcn/ui** - компоненты (Dialog, Select, etc.)
- **Radix UI** - headless компоненты
- **Lucide React** - иконки

### Drag & Drop

- **@dnd-kit** - drag-and-drop для Kanban
  - `@dnd-kit/core` - ядро
  - `@dnd-kit/sortable` - сортировка
  - `@dnd-kit/utilities` - утилиты

### Routing

- **React Router** - маршрутизация

## 📁 Структура проекта

```
src/
├── assets/           # Статические файлы
├── components/       # React компоненты
│   ├── auth/        # Авторизация (LoginForm, RegisterForm)
│   ├── board/       # Доска (Board, Column, TaskCard)
│   ├── layout/      # Layout (Sidebar, Header)
│   │── settings/		 # Настройки
│   ├── task/        # Задачи (TaskDetailModal, CreateTaskModal)
│   └── ui/          # UI компоненты (Button, Dialog, Select)
├── constants/       # Константы (priorities, tags)
├── hooks/           # Custom hooks
├── lib/             # Утилиты
│   ├── apollo.ts    # Apollo Client конфигурация
│   ├── graphql/     # GraphQL операции
│   │   ├── fragments.ts    # Фрагменты
│   │   ├── auth.ts         # Авторизация
│   │   ├── board.ts        # Доски
│   │   ├── task.ts         # Задачи
│   │   ├── comment.ts      # Комментарии
│   │   └── subscriptions.ts # WebSocket subscriptions
│   └── utils.ts     # Вспомогательные функции
├── pages/           # Страницы
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── BoardsPage.tsx
│   ├── BoardPage.tsx
│   └── SettingsPage.tsx
├── store/           # Zustand stores
│   ├── auth.store.ts  # Авторизация и пользователь
│   └── ui.store.ts    # UI состояние (модалки)
├── types/           # TypeScript типы
│   └── index.ts
├── App.tsx          # Главный компонент
└── main.tsx         # Entry point
```

## 🚀 Быстрый старт

### Установка

```bash
# Клонировать репозиторий
git clone <https://github.com/fllopperr/task-manager/tree/main/task_flow_front>
cd taskflow-front

# Установить зависимости
npm install
```

### Переменные окружения

Создай `.env` файл:

```env
VITE_API_URL=http://localhost:4000/graphql
VITE_WS_URL=ws://localhost:4000/graphql
```

### Запуск

```bash
# Development
npm run dev

# Production build
npm run build

```
