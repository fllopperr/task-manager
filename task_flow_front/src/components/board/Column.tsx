import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType } from '../../types'

interface ColumnProps {
	column: ColumnType
}

export const Column = memo(function Column({ column }: ColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id
	})

	const sortedTasks = useMemo(() => {
		return [...column.tasks].sort(
			(a, b) => Number(a.position) - Number(b.position)
		)
	}, [column.tasks])

	return (
		<div className='flex-shrink-0 w-[350px] flex flex-col bg-[#F1F3F5] rounded-[24px] p-5 min-h-[500px]'>
			<div className='flex items-center justify-between mb-6 px-1'>
				<div className='flex items-center gap-3'>
					<h3 className='font-extrabold text-[16px] text-[#1A1D21]'>
						{column.title}
					</h3>
					<span className='flex items-center justify-center w-6 h-6 text-[12px] font-bold bg-black text-white rounded-full'>
						{column.tasks.length}
					</span>
				</div>
			</div>

			<div
				ref={setNodeRef}
				className={`flex flex-col gap-4 flex-1 transition-colors rounded-2xl p-2 ${
					isOver ? 'bg-[#E9ECEF]' : ''
				}`}
			>
				<SortableContext
					items={sortedTasks.map(t => String(t.id))}
					strategy={verticalListSortingStrategy}
				>
					{sortedTasks.map(task => (
						<TaskCard key={task.id} task={task} />
					))}
				</SortableContext>
			</div>
		</div>
	)
})
