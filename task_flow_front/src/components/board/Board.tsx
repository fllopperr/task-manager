import { memo, useMemo, useCallback, useState } from 'react'
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	closestCorners,
	DragStartEvent,
	DragEndEvent
} from '@dnd-kit/core'
import { useMutation } from '@apollo/client'
import { MOVE_TASK } from '../../lib/graphql/task'
import { GET_BOARD } from '../../lib/graphql/board'
import type { Board as BoardType, Task } from '../../types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

interface BoardProps {
	board: BoardType
	search: string
	filters: {
		tags: string[]
		assignees: string[]
		priorities: string[]
	}
}

const PRIORITY_MAP: Record<string, string> = {
	Низкий: 'LOW',
	Средний: 'MEDIUM',
	Высокий: 'HIGH',
	Срочный: 'URGENT'
}

export const Board = memo(function Board({
	board,
	search,
	filters
}: BoardProps) {
	const [moveTask] = useMutation(MOVE_TASK)
	const [activeTask, setActiveTask] = useState<Task | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
	)

	const normalizedSearch = useMemo(
		() => search.trim().replace(/\s+/g, ' ').toLowerCase(),
		[search]
	)

	const filteredColumns = useMemo(() => {
		const noSearch = normalizedSearch.length === 0
		const noFilters =
			filters.tags.length === 0 &&
			filters.assignees.length === 0 &&
			filters.priorities.length === 0

		if (noSearch && noFilters) return board.columns

		return board.columns.map(column => ({
			...column,
			tasks: column.tasks.filter(task => {
				const matchesSearch =
					noSearch ||
					task.title.toLowerCase().includes(normalizedSearch) ||
					task.description?.toLowerCase().includes(normalizedSearch)

				const matchesTags =
					filters.tags.length === 0 ||
					(task.tags && task.tags.some(tag => filters.tags.includes(tag)))

				const matchesAssignees =
					filters.assignees.length === 0 ||
					(task.assignee && filters.assignees.includes(task.assignee.username))

				const matchesPriorities =
					filters.priorities.length === 0 ||
					(task.priority &&
						filters.priorities.some(
							ruPriority => PRIORITY_MAP[ruPriority] === task.priority
						))

				return (
					matchesSearch && matchesTags && matchesAssignees && matchesPriorities
				)
			})
		}))
	}, [board.columns, normalizedSearch, filters])

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = board.columns
				.flatMap(col => col.tasks)
				.find(t => t.id === event.active.id)

			if (task) setActiveTask(task)
		},
		[board.columns]
	)

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event
			setActiveTask(null)

			if (!over) return
			if (active.id === over.id) return

			const activeId = String(active.id)
			const overId = String(over.id)

			const sourceCol = board.columns.find(c =>
				c.tasks.some(t => t.id === activeId)
			)
			if (!sourceCol) return

			let destCol = board.columns.find(c => c.id === overId)
			if (!destCol) {
				destCol = board.columns.find(c => c.tasks.some(t => t.id === overId))
			}
			if (!destCol) return

			const sortedTasks = [...destCol.tasks]
				.filter(t => t.id !== activeId)
				.sort((a, b) => Number(a.position) - Number(b.position))

			const overIndex = sortedTasks.findIndex(t => t.id === overId)

			let newPosition: number

			if (sortedTasks.length === 0) {
				newPosition = 65536
			} else if (overId === destCol.id) {
				newPosition =
					Number(sortedTasks[sortedTasks.length - 1].position) + 65536
			} else if (overIndex === 0) {
				newPosition = Number(sortedTasks[0].position) / 2
			} else if (overIndex === -1) {
				newPosition =
					Number(sortedTasks[sortedTasks.length - 1].position) + 65536
			} else {
				const prevPos = Number(sortedTasks[overIndex - 1].position)
				const nextPos = Number(sortedTasks[overIndex].position)
				newPosition = (prevPos + nextPos) / 2
			}

			try {
				await moveTask({
					variables: {
						input: {
							taskId: activeId,
							newColumnId: destCol.id,
							newPosition: Math.round(newPosition)
						}
					},
					optimisticResponse: {
						moveTask: {
							__typename: 'Task',
							id: activeId,
							columnId: destCol.id,
							position: Math.round(newPosition)
						}
					},
					update: (cache, { data }) => {
						if (!data?.moveTask) return

						const existingData: any = cache.readQuery({
							query: GET_BOARD,
							variables: { id: board.id }
						})

						if (!existingData) return

						const movedTask = board.columns
							.flatMap(c => c.tasks)
							.find(t => t.id === activeId)

						if (!movedTask) return

						const newColumns = existingData.board.columns.map((col: any) => {
							const filteredTasks = col.tasks.filter(
								(t: any) => t.id !== activeId
							)

							if (col.id === destCol.id) {
								const updatedTask = {
									...movedTask,
									columnId: destCol.id,
									position: Math.round(newPosition)
								}

								return {
									...col,
									tasks: [...filteredTasks, updatedTask].sort(
										(a: any, b: any) => Number(a.position) - Number(b.position)
									)
								}
							}

							return {
								...col,
								tasks: filteredTasks
							}
						})

						cache.writeQuery({
							query: GET_BOARD,
							variables: { id: board.id },
							data: {
								board: {
									...existingData.board,
									columns: newColumns
								}
							}
						})
					}
				})
			} catch (error) {
				console.error('❌ Failed to move task:', error)
			}
		},
		[board.columns, board.id, moveTask]
	)

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className='flex h-full items-start gap-5 overflow-x-auto pb-4 px-6 scrollbar-hide'>
				{filteredColumns.map(column => (
					<Column key={column.id} column={column} />
				))}
			</div>

			<DragOverlay>
				{activeTask ? <TaskCard task={activeTask} overlay /> : null}
			</DragOverlay>
		</DndContext>
	)
})
