import { useMemo, useState } from 'react'
import { Board } from '../types'

export function useBoardsSearch(boards: Board[]) {
	const [search, setSearch] = useState('')

	const filteredBoards = useMemo(() => {
		const normalized = search.trim().toLowerCase()
		if (!normalized) return boards

		return boards.filter(board =>
			board.title.toLowerCase().includes(normalized)
		)
	}, [boards, search])

	return { search, setSearch, filteredBoards }
}
