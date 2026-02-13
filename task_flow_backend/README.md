# TaskFlow Backend

Высокопроизводительный GraphQL API для управления задачами, построенный на современных технологиях. Система поддерживает real-time обновления, кэширование статистики и надежную авторизацию.

## Технологический стек

- **Runtime:** [Bun](https://bun.sh/) — сверхбыстрая среда выполнения JavaScript/TypeScript.
- **API:** [GraphQL Yoga](https://the-guild.dev/graphql/yoga).

* **ORM:** [Prisma](https://www.prisma.io/) с поддержкой PostgreSQL.
* **Cache & PubSub:** [Redis](https://redis.io/) (ioredis) для мгновенных уведомлений и кэша.
* **Auth:** JWT (jsonwebtoken) + Безопасное хеширование паролей через `Bun.password`.

---

## Модели данных (Data Schema)

Проект оперирует следующими сущностями:

- **User**: Пользователи и их учетные данные.
- **Board**: Проекты/Доски для организации задач.
- **Column**: Колонки (статусы) на доске (например, "В работе", "Готово").
- **Task**: Карточки задач с описанием и исполнителями.
- **Comment**: Обсуждения внутри каждой задачи.
- **Priority**: Настраиваемые уровни приоритетности задач.

---

## Эндпоинты

|`http://localhost:3000/graphql`|

---

## Авторизация (Authentication)

Сервер использует стандарт **JWT**.

1.  **Получение токена:** Используйте мутации `register` или `login`.
2.  **HTTP Заголовки:** Передавайте токен в каждом запросе:
    `Authorization: Bearer <your_jwt_token>`
3.  **WebSockets:** Для подписок передавайте токен в параметрах соединения (`connectionParams`):
    `{ "authorization": "Bearer <your_jwt_token>" }`

---

## Примеры GraphQL запросов

### 1. Регистрация нового пользователя

```graphql
mutation Register($input: UserCreateInput!) {
	register(data: $input) {
		token
		user {
			id
			username
			email
		}
	}
}
```

### 2. Авторизация пользователя

```graphql
mutation Login($input: UserLoginInput!) {
	login(data: $input) {
		token
		user {
			id
			username
			email
		}
	}
}
```

### 3. Получение текущего пользователя

```graphql
query CurrentUser {
	currentUser {
		id
		username
		email
	}
}
```

## 4. Подписка на создание задач

```graphql
subscription OnTaskCreated($boardId: ID!) {
	taskCreated(boardId: $boardId) {
		id
		title
		columnId
	}
}
```

## Установка и запуск

## 1. Переменные окружения

Создайте файл .env в корне проекта:

```
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret"
```

## 2. Установка зависимостей

Установите зависимости с помощью bun:

```
bun install
```

## 3. Генерация Prisma Client и миграции

```
bunx prisma migrate dev
bunx prisma generate
```

## 4. Запуск сервера

Запустите сервер в режиме разработки:

```
bun dev
```

## Безопасность и завершение работы

Сервер поддерживает Graceful Shutdown. При остановке процесса (SIGINT/SIGTERM) сервер корректно закрывает соединения с базой данных Prisma и Redis, гарантируя целостность данных.
