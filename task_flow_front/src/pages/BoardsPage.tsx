import { useQuery } from '@apollo/client'
import { Plus, Search } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { GET_BOARDS } from '../lib/graphql/board'
import { useUIActions } from '../store/ui.store'
import { useAuthStore } from '../store/auth.store'
import { BoardCard } from '../components/board/BoardCard'
import { CreateBoardModal } from '../components/board/CreateBoardModel'
import { useBoardsSearch } from '../hooks/useBoardsSearch'
import { useDeleteBoard } from '../hooks/useDeleteBoard'
import type { Board } from '../types'

export function BoardsPage() {
	const { data, loading } = useQuery<{ boards: Board[] }>(GET_BOARDS)
	const { openModal } = useUIActions()
	const user = useAuthStore(s => s.user)

	const boards = data?.boards || []
	const { search, setSearch, filteredBoards } = useBoardsSearch(boards)

	const { deleteBoard, loading: deleteLoading } = useDeleteBoard()

	const handleDelete = (board: Board) => {
		deleteBoard(board.id, board.title)
	}

	return (
		<div className='flex h-screen bg-white overflow-hidden p-4'>
			<Sidebar />

			<div className='flex-1 flex flex-col bg-white rounded-[32px] ml-4 overflow-hidden relative'>
				{/* Header */}
				<header className='h-20 px-10 flex items-center justify-between border-b border-gray-50'>
					<div className='flex items-center gap-8'>
						<h1 className='text-xl font-bold text-[#1A1D21]'>Мои доски</h1>
						<span className='text-sm font-semibold text-[#9EA5AD] uppercase tracking-wider'>
							{boards.length} Досок
						</span>
					</div>

					<div className='flex items-center gap-6'>
						{/* Search */}
						<div className='relative'>
							<Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black' />
							<input
								value={search}
								onChange={e => setSearch(e.target.value)}
								placeholder='поиск доски...'
								className='pl-11 pr-5 py-2.5 bg-[#F5F7F9] text-black rounded-lg text-sm w-[310px] focus:ring-2 ring-black outline-none'
							/>
						</div>

						{/* Create Button */}
						<button
							onClick={() => openModal('boardCreate')}
							className='flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm'
						>
							<Plus className='w-4 h-4 text-black' />
							<span className='text-black'>Новая доска</span>
						</button>

						{/* Profile */}
						<div className='flex items-center gap-3 pl-6'>
							<div className='text-right'>
								<p className='text-sm font-bold text-[#1A1D21] leading-none'>
									{user?.username}
								</p>
								<p className='text-[11px] text-[#9EA5AD]'>{user?.email}</p>
							</div>
							<div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold'>
								{user?.username?.[0]?.toUpperCase() || 'А'}
							</div>
						</div>
					</div>
				</header>

				{/* Boards Grid */}
				<main className='flex-1 overflow-y-auto p-10 bg-[#F8F9FB]'>
					{loading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse'>
							{[1, 2, 3].map(i => (
								<div key={i} className='h-48 bg-gray-200 rounded-[24px]' />
							))}
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
							{filteredBoards.map(board => (
								<BoardCard
									key={board.id}
									board={board}
									onDelete={() => handleDelete(board)}
									deleting={deleteLoading}
								/>
							))}

							{/* Create Board Placeholder */}
							<button
								onClick={() => openModal('boardCreate')}
								className='h-full min-h-[180px] border-2 border-dashed border-[#DEE2E6] rounded-[24px] flex flex-col items-center justify-center gap-3 text-[#ADB5BD] hover:border-black hover:text-black hover:bg-white transition-all group'
							>
								<div className='p-3 bg-gray-50 rounded-full group-hover:bg-gray-300 transition-colors'>
									<Plus className='w-6 h-6' />
								</div>
								<span className='font-bold text-sm'>Создать доску</span>
							</button>
						</div>
					)}
				</main>
			</div>

			<CreateBoardModal />
		</div>
	)
}
