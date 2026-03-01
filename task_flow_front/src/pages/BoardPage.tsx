import { useState, useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { Board } from '../components/board/Board'
import { CreateTaskModal } from '../components/task/CreateTaskModal'
import { TaskDetailModal } from '../components/task/TaskDetailModal'
import { useBoard } from '../hooks/useBoard'
import { useBoardStats } from '../hooks/useBoardStats'

const LoadingState = memo(() => (
	<div className='flex h-screen bg-[#0B0D10] p-4 overflow-hidden'>
		<Sidebar />
		<div className='flex-1 flex flex-col bg-white rounded-[32px] ml-4 overflow-hidden items-center justify-center text-center'>
			<Loader2 className='w-8 h-8 animate-spin text-black' />
		</div>
	</div>
))
LoadingState.displayName = 'LoadingState'

const ErrorState = memo(() => (
	<div className='flex h-screen bg-[#0B0D10] p-4 overflow-hidden'>
		<Sidebar />
		<div className='flex-1 flex flex-col bg-white rounded-[32px] ml-4 overflow-hidden items-center justify-center text-center'>
			<div className='max-w-md space-y-4'>
				<h2 className='text-2xl font-bold text-[#1A1D21]'>
					Упс! Доска не найдена
				</h2>
				<p className='text-[#9EA5AD]'>
					Возможно, у вас нет доступа или доска была удалена.
				</p>
			</div>
		</div>
	</div>
))
ErrorState.displayName = 'ErrorState'

export function BoardPage() {
	const { boardId } = useParams<{ boardId: string }>()
	const { board, loading, error } = useBoard(boardId)
	const stats = useBoardStats(board)

	const [search, setSearch] = useState('')
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [filters, setFilters] = useState({
		tags: [] as string[],
		assignees: [] as string[],
		priorities: [] as string[]
	})

	const toggleFilters = useCallback(() => setFiltersOpen(v => !v), [])

	if (loading && !board) return <LoadingState />
	if (error || !board) return <ErrorState />

	return (
		<div className='flex h-screen bg-white p-4 overflow-hidden font-sans'>
			<Sidebar />

			<div className='flex-1 flex flex-col bg-white rounded-[32px] ml-4 overflow-hidden relative shadow-2xl'>
				<div className='px-10 pt-10 pb-6'>
					<Header
						boardTitle={board.title}
						taskCount={stats.total}
						inProgressCount={stats.inProgress}
						doneCount={stats.done}
						overdueCount={0}
						search={search}
						onSearchChange={setSearch}
						filtersOpen={filtersOpen}
						onToggleFilters={toggleFilters}
						filters={filters}
						onChangeFilters={setFilters}
						boardMembers={board.members}
						boardOwner={board.owner}
						columns={board.columns}
					/>
				</div>

				<main className='flex-1 overflow-x-auto px-10'>
					<Board board={board} search={search} filters={filters} />
				</main>
			</div>

			<CreateTaskModal />
			<TaskDetailModal />
		</div>
	)
}
