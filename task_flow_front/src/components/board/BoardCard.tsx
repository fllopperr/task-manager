import { Link } from 'react-router-dom'
import { Layout, ArrowRight, X } from 'lucide-react'
import type { Board } from '../../types'
import React from 'react'

interface BoardCardProps {
	board: Board
	onDelete?: () => void
	deleting?: boolean
}

export const BoardCard = React.memo(function BoardCard({
	board,
	onDelete,
	deleting
}: BoardCardProps) {
	const handleDelete = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.()
	}

	return (
		<Link
			to={`/board/${board.id}`}
			className='group flex flex-col p-8 rounded-[32px] bg-white border-2 border-[#E9ECEF] hover:border-[#1A1D21] hover:shadow-xl transition-all duration-300 relative overflow-hidden h-[200px]'
		>
			{onDelete && (
				<button
					onClick={handleDelete}
					disabled={deleting}
					title='Удалить доску'
					className='absolute top-1 right-1 z-20 p-2 text-white group-hover:text-black transition-all duration-200 disabled:cursor-not-allowed'
				>
					<X className='w-5 h-5' />
				</button>
			)}

			<div className='flex items-start justify-between mb-auto'>
				<div className='w-12 h-12 bg-[#F1F3F5] rounded-2xl flex items-center justify-center group-hover:bg-[#1A1D21] group-hover:text-white transition-colors'>
					<Layout className='w-6 h-6' />
				</div>

				<span className='px-3 py-1 bg-[#F1F3F5] rounded-full text-[12px] font-bold text-[#1A1D21]'>
					{board._count?.tasks || 0} задач
				</span>
			</div>

			<div>
				<h3 className='text-xl font-black text-[#1A1D21] mb-1 group-hover:translate-x-1 transition-transform'>
					{board.title}
				</h3>
				<p className='text-sm text-[#9EA5AD] font-medium'>
					Открыть рабочее пространство
				</p>
			</div>

			<ArrowRight className='absolute bottom-8 right-8 w-6 h-6 text-[#1A1D21] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all' />
		</Link>
	)
})
