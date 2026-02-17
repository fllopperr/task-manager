import { createPubSub } from '@graphql-yoga/subscription'

export const pubSub = createPubSub<{
	TASK_CREATED: [boardId: string, payload: { taskCreated: any }]
	TASK_UPDATED: [boardId: string, payload: { taskUpdated: any }]
	TASK_DELETED: [boardId: string, payload: { taskDeleted: string }]
	TASK_MOVED: [boardId: string, payload: { taskMoved: any }]
	COMMENT_ADDED: [boardId: string, payload: { commentAdded: any }]
	COMMENT_UPDATED: [boardId: string, payload: { commentUpdated: any }]
	COMMENT_DELETED: [boardId: string, payload: { commentDeleted: string }]
	BOARD_MEMBER_ADDED: [boardId: string, payload: { boardMemberAdded: any }]
	BOARD_MEMBER_REMOVED: [
		boardId: string,
		payload: { boardMemberRemoved: string }
	]
	COLUMN_CREATED: [boardId: string, payload: { columnCreated: any }]
	COLUMN_UPDATED: [boardId: string, payload: { columnUpdated: any }]
	COLUMN_DELETED: [boardId: string, payload: { columnDeleted: string }]
	USER_PRESENCE: [
		boardId: string,
		payload: {
			userPresence: { userId: string; status: 'online' | 'offline' | 'away' }
		}
	]
	USER_TYPING: [
		boardId: string,
		payload: { userTyping: { userId: string; userName: string } }
	]
}>()
