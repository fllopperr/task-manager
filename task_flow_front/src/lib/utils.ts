import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(
	date: string | number | Date | null | undefined,
	pattern = 'd MMMM yyyy, HH:mm'
): string {
	if (!date) return ''
	try {
		const parsedDate =
			typeof date === 'string' ? parseISO(date) : new Date(date)
		if (!isValid(parsedDate)) return ''
		return format(parsedDate, pattern, { locale: ru })
	} catch {
		return ''
	}
}

export function formatTaskDate(
	date: string | number | Date | null | undefined
): string {
	if (!date) return ''
	try {
		const parsedDate =
			typeof date === 'string' ? parseISO(date) : new Date(date)
		if (!isValid(parsedDate)) return ''
		return format(parsedDate, 'd MMM', { locale: ru }).replace('.', '')
	} catch {
		return ''
	}
}

export function getPriorityColor(priority?: string) {
	const colors: Record<string, string> = {
		LOW: 'bg-blue-500',
		MEDIUM: 'bg-yellow-500',
		HIGH: 'bg-orange-500',
		URGENT: 'bg-red-500'
	}
	return priority ? colors[priority] || 'bg-gray-400' : 'bg-gray-400'
}

export function getPriorityLabel(priority?: string) {
	const labels: Record<string, string> = {
		LOW: 'Низкий',
		MEDIUM: 'Средний',
		HIGH: 'Высокий',
		URGENT: 'Срочный'
	}
	return priority ? labels[priority] || 'Без приоритета' : 'Без приоритета'
}

export function getPriorityData(priority?: string) {
	const config: Record<
		string,
		{ label: string; color: string; iconColor: string }
	> = {
		LOW: {
			label: 'Низкий',
			color: 'bg-blue-100 text-blue-700',
			iconColor: 'text-blue-500'
		},
		MEDIUM: {
			label: 'Средний',
			color: 'bg-yellow-100 text-yellow-700',
			iconColor: 'text-yellow-500'
		},
		HIGH: {
			label: 'Высокий',
			color: 'bg-orange-100 text-orange-700',
			iconColor: 'text-orange-500'
		},
		URGENT: {
			label: 'Срочный',
			color: 'bg-red-100 text-red-700',
			iconColor: 'text-red-500'
		}
	}

	return priority && config[priority]
		? config[priority]
		: {
				label: 'Без приоритета',
				color: 'bg-gray-100 text-gray-600',
				iconColor: 'text-gray-400'
			}
}
