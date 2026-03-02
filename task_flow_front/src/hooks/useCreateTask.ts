import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_TASK } from '../lib/graphql/task'
import { GET_BOARD } from '../lib/graphql/board'
import type { Priority } from '../types'

export function useCreateTask(
	boardId: string | undefined,
	initialColumnId?: string | null | undefined,
	onSuccess?: () => void
) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [priority, setPriority] = useState<Priority>('MEDIUM')
	const [columnId, setColumnId] = useState('')

	useEffect(() => {
		if (initialColumnId && !columnId) {
			setColumnId(initialColumnId)
		}
	}, [initialColumnId, columnId])

	const [createTaskMutation, { loading }] = useMutation(CREATE_TASK, {
		refetchQueries: [{ query: GET_BOARD, variables: { id: boardId } }],
		onCompleted: () => {
			reset()
			onSuccess?.()
		}
	})

	const createTask = () => {
		if (!title.trim() || !columnId) return

		createTaskMutation({
			variables: {
				input: {
					title: title.trim(),
					description: description.trim(),
					priority,
					columnId,
					tags: []
				}
			}
		})
	}

	const reset = () => {
		setTitle('')
		setDescription('')
		setPriority('MEDIUM')
		setColumnId('')
	}

	return {
		title,
		setTitle,
		description,
		setDescription,
		priority,
		setPriority,
		columnId,
		setColumnId,
		loading,
		createTask,
		reset
	}
}
