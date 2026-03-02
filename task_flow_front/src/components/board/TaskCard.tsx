import { memo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { useUIActions } from '../../store/ui.store'
import { getPriorityData, formatTaskDate } from '../../lib/utils'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { DELETE_TASK } from '../../lib/graphql/task'
import { GET_BOARD } from '../../lib/graphql/board'
import { AlertCircle, X, User, Calendar } from 'lucide-react'
import type { Task } from '../../types'

interface TaskCardProps {
	task: Task
	overlay?: boolean
}

export const TaskCard = memo(function TaskCard({
	task,
	overlay
}: TaskCardProps) {
	const { boardId } = useParams<{ boardId: string }>()
	const { openModal } = useUIActions()
	const { parseSafeDate } = useDateFormatter()
	const { label: priorityLabel } = getPriorityData(task.priority)

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id: String(task.id) })

	const [deleteTask] = useMutation(DELETE_TASK, {
		update: cache => {
			const existingData: any = cache.readQuery({
				query: GET_BOARD,
				variables: { id: boardId }
			})

			if (!existingData) return

			const newColumns = existingData.board.columns.map((col: any) => ({
				...col,
				tasks: col.tasks.filter((t: any) => t.id !== task.id)
			}))

			cache.writeQuery({
				query: GET_BOARD,
				variables: { id: boardId },
				data: {
					board: {
						...existingData.board,
						columns: newColumns
					}
				}
			})
		}
	})

	const handleCardClick = useCallback(
		(e: React.MouseEvent) => {
			if ((e.target as HTMLElement).closest('button')) return
			openModal('taskDetail', { task })
		},
		[openModal, task]
	)

	const handleDelete = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation()

			if (confirm(`Удалить задачу "${task.title}"?`)) {
				try {
					await deleteTask({
						variables: { id: task.id }
					})
				} catch (error) {
					console.error('Failed to delete task:', error)
				}
			}
		},
		[task.id, task.title, deleteTask]
	)

	const style = overlay
		? undefined
		: {
				transform: CSS.Transform.toString(transform),
				transition,
				cursor: isDragging ? 'grabbing' : 'grab'
			}

	return (
		<div
			ref={overlay ? undefined : setNodeRef}
			{...(overlay ? {} : attributes)}
			{...(overlay ? {} : listeners)}
			onClick={handleCardClick}
			style={style}
			className={`group relative flex flex-col p-5 rounded-[24px] bg-[#D4D4D4] hover:bg-[#C8C8C8] transition-all shadow-sm ${
				isDragging ? 'opacity-50' : ''
			}`}
		>
			<div className='flex justify-between items-start mb-3'>
				<div className='flex flex-wrap gap-1.5'>
					{task.tags?.map(tag => (
						<span
							key={tag}
							className='px-2.5 py-0.5 bg-black text-white rounded-md text-[9px] font-black uppercase tracking-wider'
						>
							{tag}
						</span>
					))}
				</div>
				<button
					onClick={handleDelete}
					className='text-black/20 hover:text-black transition-colors'
					title='Удалить задачу'
				>
					<X className='w-5 h-5 stroke-[3px]' />
				</button>
			</div>

			<h4 className='text-[17px] font-black text-black leading-tight mb-1'>
				{task.title}
			</h4>

			{task.description && (
				<p className='text-[13px] text-black/50 font-bold line-clamp-1 mb-4'>
					{task.description}
				</p>
			)}

			<div className='flex items-center gap-4 mb-4 text-black'>
				<div className='flex items-center gap-1.5'>
					<AlertCircle className='w-4 h-4 stroke-[2.5px]' />
					<span className='text-[13px] font-black'>{priorityLabel}</span>
				</div>
				{task.limitDate && (
					<div className='flex items-center gap-1.5'>
						<Calendar className='w-4 h-4 stroke-[2.5px]' />
						<span className='text-[13px] font-black'>
							{formatTaskDate(parseSafeDate(task.limitDate))}
						</span>
					</div>
				)}
			</div>

			<div className='mt-auto flex items-center gap-3'>
				<div className='w-9 h-9 bg-black rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg'>
					{task.assignee?.username ? (
						<span className='text-white text-[11px] font-black uppercase'>
							{task.assignee.username.charAt(0)}
						</span>
					) : (
						<User className='w-4 h-4 text-white opacity-30' />
					)}
				</div>

				{task.assignee?.username && (
					<span className='text-[13px] font-black text-black truncate'>
						{task.assignee.username}
					</span>
				)}
			</div>
		</div>
	)
})
