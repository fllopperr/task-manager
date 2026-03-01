export const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export const PRIORITY_LABELS: Record<string, string> = {
	LOW: 'Низкий',
	MEDIUM: 'Средний',
	HIGH: 'Высокий',
	URGENT: 'Срочный'
}

export const TAG_VALUES = [
	'Bug',
	'API',
	'Feature',
	'Refactor',
	'Design',
	'Marketing'
] as const

export const ALL_PRIORITIES = PRIORITY_VALUES.map(p => PRIORITY_LABELS[p])

export const ALL_TAGS = [...TAG_VALUES]
