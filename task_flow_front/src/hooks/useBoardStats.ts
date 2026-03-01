import { useMemo } from 'react'
import type { Board } from '../types'

export function useBoardStats(board?: Board) {
	return useMemo(() => {
		if (!board) return { total: 0, inProgress: 0, done: 0 }

		let total = 0
		let inProgress = 0
		let done = 0

		for (const col of board.columns) {
			const count = col.tasks.length
			total += count

			const title = col.title.toLowerCase()
			if (title.includes('progress') || title.includes('работе')) {
				inProgress += count
			}
			if (title.includes('done') || title.includes('завершено')) {
				done += count
			}
		}

		return { total, inProgress, done }
	}, [board])
}
