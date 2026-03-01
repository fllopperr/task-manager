import { useState, useMemo, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
	LayoutDashboard,
	Settings,
	LogOut,
	ChevronDown,
	Plus,
	X
} from 'lucide-react'
import { useQuery } from '@apollo/client'
import { GET_BOARDS } from '../../lib/graphql/board'
import { useUIActions } from '../../store/ui.store'
import { useAuthActions } from '../../store/auth.store'
import { useDeleteBoard } from '../../hooks/useDeleteBoard'
import type { Board } from '../../types'
import { cn } from '../../lib/utils'

export function Sidebar() {
	const { boardId } = useParams<{ boardId: string }>()
	const [isDashboardOpen, setIsDashboardOpen] = useState(true)

	const { openModal } = useUIActions()
	const { logout } = useAuthActions()

	const { data, loading: boardsLoading } = useQuery<{ boards: Board[] }>(
		GET_BOARDS
	)
	const { deleteBoard, loading: deleteLoading } = useDeleteBoard()

	const boards = useMemo(() => data?.boards || [], [data])
	const boardsCount = boards.length

	const toggleDashboard = useCallback(() => {
		setIsDashboardOpen(v => !v)
	}, [])

	const handleCreateBoard = useCallback(() => {
		openModal('boardCreate')
	}, [openModal])

	const handleDelete = useCallback(
		(e: React.MouseEvent, board: Board) => {
			e.preventDefault()
			e.stopPropagation()
			deleteBoard(board.id, board.title)
		},
		[deleteBoard]
	)

	return (
		<aside className='w-[280px] bg-[#0B0D10] rounded-[32px] flex flex-col p-8 text-white shrink-0 h-full overflow-y-auto'>
			<div className='mb-12 px-2'>
				<Link to='/'>
					<h1 className='text-[32px] font-bold tracking-tight text-white'>
						TaskFlow
					</h1>
				</Link>
			</div>

			<nav className='flex-1 flex flex-col gap-4'>
				<div className='flex flex-col'>
					<button
						onClick={toggleDashboard}
						className={cn(
							'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-lg w-full',
							isDashboardOpen ? 'text-white' : 'text-[#787D85] hover:text-white'
						)}
					>
						<LayoutDashboard className='w-6 h-6' />
						<span>Dashboard</span>
						<ChevronDown
							className={cn(
								'w-5 h-5 ml-auto transition-transform duration-200',
								isDashboardOpen && 'rotate-180'
							)}
						/>
						{!boardsLoading && boardsCount > 0 && (
							<span className='ml-2 text-sm opacity-60'>{boardsCount}</span>
						)}
					</button>

					{isDashboardOpen && (
						<div className='flex flex-col mt-2 ml-4 pl-4 gap-2 animate-in slide-in-from-top-2 duration-200'>
							{boardsLoading ? (
								<div className='py-2 text-[15px] text-[#787D85] animate-pulse'>
									Загрузка...
								</div>
							) : (
								boards.map(board => (
									<div key={board.id} className='relative group'>
										<Link
											to={`/board/${board.id}`}
											className={cn(
												'py-2 pr-8 text-[16px] font-semibold transition-colors truncate block',
												boardId === board.id
													? 'text-white'
													: 'text-[#787D85] hover:text-white'
											)}
										>
											{board.title}
										</Link>

										<button
											onClick={e => handleDelete(e, board)}
											disabled={deleteLoading}
											className='absolute top-1/2 -translate-y-1/2 right-0 p-1 text-white transition-all active:scale-150 disabled:cursor-not-allowed'
											title='Удалить доску'
										>
											<X className='w-4 h-4' />
										</button>
									</div>
								))
							)}

							<button
								onClick={handleCreateBoard}
								className='flex items-center gap-2 py-2 text-[#787D85] hover:text-white transition-colors text-[15px] font-medium group'
							>
								<Plus className='w-5 h-5 text-white font-semibold' />
								<span className='text-white font-semibold text-[16px]'>
									Новая доска
								</span>
							</button>
						</div>
					)}
				</div>

				<Link
					to='/settings'
					className='flex items-center gap-3 px-4 py-3 text-[#787D85] hover:text-white transition-all font-bold text-lg'
				>
					<Settings className='w-6 h-6' />
					<span>Settings</span>
				</Link>
			</nav>

			<button
				onClick={logout}
				className='mt-auto flex items-center gap-3 px-4 py-3 text-[#787D85] hover:text-white transition-all font-bold text-lg group'
			>
				<LogOut className='w-6 h-6 rotate-180 group-hover:translate-x-1 transition-transform' />
				<span>Logout</span>
			</button>
		</aside>
	)
}
