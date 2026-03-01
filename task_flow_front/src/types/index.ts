export const PriorityLevels = {
	LOW: 'LOW',
	MEDIUM: 'MEDIUM',
	HIGH: 'HIGH',
	URGENT: 'URGENT'
} as const

export const Tags = {
	BUG: 'Bug',
	FEATURE: 'Feature',
	DESIGN: 'Design',
	REFACTOR: 'Refactor',
	API: 'API',
	MARKETING: 'Marketing'
}
export type Tags = keyof typeof Tags
export type Priority = keyof typeof PriorityLevels
export type BoardRole = 'ADMIN' | 'MEMBER'

export interface User {
	readonly id: string
	readonly username: string
	readonly email: string
}

export interface Board {
	id: string
	title: string
	description?: string
	icon?: string
	owner: User
	columns: Column[]
	members: BoardMember[]
	_count?: {
		columns: number
		tasks: number
	}
}

export interface BoardMember {
	id: string
	role: BoardRole
	userId: string
	boardId: string
	user: User
}

export interface Column {
	id: string
	title: string
	position: number
	tasks: Task[]
}

export interface Task {
	readonly id: string
	title: string
	description?: string
	position: number
	priority?: Priority
	tags: string[]
	columnId: string
	ownerId: string
	assigneeId?: string
	limitDate?: string
	createdAt: string
	updatedAt: string
	owner?: User
	assignee?: User
	comments?: Comment[]
}

export interface Comment {
	id: string
	content: string
	createdAt: string
	updatedAt: string
	taskId: string
	userId: string
	user: User
}

export interface AuthResponse {
	token: string
	user: User
}
