import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { UPDATE_TASK, DELETE_TASK } from '../lib/graphql/task'
import { GET_BOARD } from '../lib/graphql/board'

export function useTaskUpdate(
	task: any,
	boardId: string | undefined,
	onDelete?: () => void
) {
	const [localTitle, setLocalTitle] = useState('')
	const [localDesc, setLocalDesc] = useState('')
	const [newComment, setNewComment] = useState('')

	const { data: boardData } = useQuery(GET_BOARD, {
		variables: { id: boardId },
		skip: !boardId
	})

	useEffect(() => {
		if (task) {
			setLocalTitle(task.title || '')
			setLocalDesc(task.description || '')
		}
	}, [task?.id, task?.title, task?.description])

	const [updateTask] = useMutation(UPDATE_TASK, {
		refetchQueries: [{ query: GET_BOARD, variables: { id: boardId } }]
	})

	const [deleteTask] = useMutation(DELETE_TASK, {
		onCompleted: onDelete,
		refetchQueries: [{ query: GET_BOARD, variables: { id: boardId } }]
	})

	const handleUpdate = (fields: any) => {
		if (!task?.id) return

		if (
			fields.columnId &&
			fields.columnId !== task.columnId &&
			boardData?.board
		) {
			console.log('🟢 Column changed:', {
				from: task.columnId,
				to: fields.columnId
			})

			const targetColumn = boardData.board.columns.find(
				(c: any) => c.id === fields.columnId
			)

			if (targetColumn) {
				console.log('🟡 Target column found:', {
					columnId: targetColumn.id,
					tasksCount: targetColumn.tasks.length
				})

				const tasks = [...targetColumn.tasks]
					.filter((t: any) => t.id !== task.id)
					.sort((a: any, b: any) => Number(a.position) - Number(b.position))

				const newPosition =
					tasks.length === 0
						? 65536
						: Number(tasks[tasks.length - 1].position) + 65536
				fields.position = newPosition
			}
		}
		updateTask({
			variables: { id: task.id, input: fields }
		})
	}

	const handleDelete = () => {
		if (!task?.id) return
		if (confirm('Удалить задачу?')) {
			deleteTask({ variables: { id: task.id } })
		}
	}

	const toggleTag = (tag: string) => {
		if (!task) return
		const currentTags = task.tags ? [...task.tags] : []
		const newTags = currentTags.includes(tag)
			? currentTags.filter((t: string) => t !== tag)
			: [...currentTags, tag]
		handleUpdate({ tags: newTags })
	}

	return {
		localTitle,
		setLocalTitle,
		localDesc,
		setLocalDesc,
		newComment,
		setNewComment,
		handleUpdate,
		handleDelete,
		toggleTag
	}
}
