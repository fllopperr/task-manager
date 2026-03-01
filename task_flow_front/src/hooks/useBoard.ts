import { useQuery, useSubscription } from '@apollo/client'
import { GET_BOARD } from '../lib/graphql/board'
import * as SUBS from '../lib/graphql/subscriptions'
import {
	TASK_FIELDS,
	COMMENT_FIELDS,
	COLUMN_FIELDS
} from '../lib/graphql/fragments'
import type { Board, Task, Column, Comment } from '../types'

interface UseBoardReturn {
	board?: Board
	loading: boolean
	error?: any
}

export function useBoard(boardId: string | undefined): UseBoardReturn {
	const { data, loading, error, client } = useQuery<{ board: Board }>(
		GET_BOARD,
		{
			variables: { id: boardId },
			skip: !boardId
		}
	)

	if (!client) return { board: data?.board, loading, error }

	// ---------------- TASK SUBSCRIPTIONS ----------------

	useSubscription(SUBS.TASK_CREATED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const newTask: Task | undefined = data?.taskCreated
			if (!newTask) return

			const colId = newTask.columnId
			client.cache.modify({
				id: client.cache.identify({ __typename: 'Column', id: colId }),
				fields: {
					tasks(existingRefs = []) {
						return [
							...existingRefs,
							client.cache.writeFragment({
								data: newTask,
								fragment: TASK_FIELDS
							})
						]
					}
				}
			})
		}
	})

	useSubscription(SUBS.TASK_UPDATED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const updated: Task | undefined = data?.taskUpdated
			if (!updated) return
			client.cache.writeFragment({
				id: client.cache.identify({ __typename: 'Task', id: updated.id }),
				fragment: TASK_FIELDS,
				data: updated
			})
		}
	})

	useSubscription(SUBS.TASK_MOVED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const moved = data?.taskMoved
			if (!moved) return

			// При перемещении мы просто обновляем поля существующей задачи в кэше
			client.cache.modify({
				id: client.cache.identify({ __typename: 'Task', id: moved.id }),
				fields: {
					columnId: () => moved.columnId,
					position: () => moved.position
				}
			})
		}
	})

	useSubscription(SUBS.TASK_DELETED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			if (!data?.taskDeleted) return
			client.cache.evict({
				id: client.cache.identify({ __typename: 'Task', id: data.taskDeleted })
			})
			client.cache.gc()
		}
	})

	// ---------------- COMMENT SUBSCRIPTIONS ----------------

	useSubscription(SUBS.COMMENT_ADDED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const newComment: Comment | undefined = data?.commentAdded
			if (!newComment) return

			client.cache.modify({
				id: client.cache.identify({
					__typename: 'Task',
					id: newComment.taskId
				}),
				fields: {
					comments(existingRefs = []) {
						return [
							...existingRefs,
							client.cache.writeFragment({
								data: newComment,
								fragment: COMMENT_FIELDS
							})
						]
					}
				}
			})
		}
	})

	useSubscription(SUBS.COMMENT_UPDATED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const updated: Comment | undefined = data?.commentUpdated
			if (!updated) return
			client.cache.writeFragment({
				id: client.cache.identify({ __typename: 'Comment', id: updated.id }),
				fragment: COMMENT_FIELDS,
				data: updated
			})
		}
	})

	useSubscription(SUBS.COMMENT_DELETED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			if (!data?.commentDeleted) return
			client.cache.evict({
				id: client.cache.identify({
					__typename: 'Comment',
					id: data.commentDeleted
				})
			})
			client.cache.gc()
		}
	})

	// ---------------- COLUMN SUBSCRIPTIONS ----------------

	useSubscription(SUBS.COLUMN_CREATED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const newCol: Column | undefined = data?.columnCreated
			if (!newCol || !boardId) return
			client.cache.modify({
				id: client.cache.identify({ __typename: 'Board', id: boardId }),
				fields: {
					columns(existingRefs = []) {
						return [
							...existingRefs,
							client.cache.writeFragment({
								data: newCol,
								fragment: COLUMN_FIELDS
							})
						]
					}
				}
			})
		}
	})

	useSubscription(SUBS.COLUMN_UPDATED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			const updatedCol: Column | undefined = data?.columnUpdated
			if (!updatedCol) return
			client.cache.writeFragment({
				id: client.cache.identify({ __typename: 'Column', id: updatedCol.id }),
				fragment: COLUMN_FIELDS,
				data: updatedCol
			})
		}
	})

	useSubscription(SUBS.COLUMN_DELETED_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			if (!data?.columnDeleted) return
			client.cache.evict({
				id: client.cache.identify({
					__typename: 'Column',
					id: data.columnDeleted
				})
			})
			client.cache.gc()
		}
	})

	// ---------------- PRESENCE & TYPING ----------------

	useSubscription(SUBS.USER_PRESENCE_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			// Реализация зависит от вашего глобального стора (Zustand/Redux)
		}
	})

	useSubscription(SUBS.USER_TYPING_SUB, {
		variables: { boardId },
		skip: !boardId,
		onData: ({ data: { data } }) => {
			// Реализация зависит от вашего глобального стора (Zustand/Redux)
		}
	})

	return {
		board: data?.board,
		loading,
		error
	}
}
