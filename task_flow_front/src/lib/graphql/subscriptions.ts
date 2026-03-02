import { gql } from '@apollo/client'
import { TASK_FIELDS, COMMENT_FIELDS, USER_FIELDS } from './fragments'

export const TASK_CREATED_SUB = gql`
	subscription TaskCreated($boardId: ID!) {
		taskCreated(boardId: $boardId) {
			...TaskFields
		}
	}
	${TASK_FIELDS}
`

export const TASK_UPDATED_SUB = gql`
	subscription TaskUpdated($boardId: ID!) {
		taskUpdated(boardId: $boardId) {
			...TaskFields
		}
	}
	${TASK_FIELDS}
`

export const TASK_MOVED_SUB = gql`
	subscription TaskMoved($boardId: ID!) {
		taskMoved(boardId: $boardId) {
			id
			columnId
			position
		}
	}
`

export const TASK_DELETED_SUB = gql`
	subscription TaskDeleted($boardId: ID!) {
		taskDeleted(boardId: $boardId)
	}
`

export const COMMENT_ADDED_SUB = gql`
	subscription CommentAdded($boardId: ID!) {
		commentAdded(boardId: $boardId) {
			...CommentFields
		}
	}
	${COMMENT_FIELDS}
`

export const COMMENT_UPDATED_SUB = gql`
	subscription CommentUpdated($boardId: ID!) {
		commentUpdated(boardId: $boardId) {
			...CommentFields
		}
	}
	${COMMENT_FIELDS}
`

export const COMMENT_DELETED_SUB = gql`
	subscription CommentDeleted($boardId: ID!) {
		commentDeleted(boardId: $boardId)
	}
`

export const COLUMN_CREATED_SUB = gql`
	subscription ColumnCreated($boardId: ID!) {
		columnCreated(boardId: $boardId) {
			id
			title
			position
		}
	}
`

export const COLUMN_UPDATED_SUB = gql`
	subscription ColumnUpdated($boardId: ID!) {
		columnUpdated(boardId: $boardId) {
			id
			title
			position
		}
	}
`

export const COLUMN_DELETED_SUB = gql`
	subscription ColumnDeleted($boardId: ID!) {
		columnDeleted(boardId: $boardId)
	}
`

export const BOARD_MEMBER_ADDED_SUB = gql`
	subscription BoardMemberAdded($boardId: ID!) {
		boardMemberAdded(boardId: $boardId) {
			id
			role
			user {
				...UserFields
			}
		}
	}
	${USER_FIELDS}
`

export const BOARD_MEMBER_REMOVED_SUB = gql`
	subscription BoardMemberRemoved($boardId: ID!) {
		boardMemberRemoved(boardId: $boardId)
	}
`

export const USER_PRESENCE_SUB = gql`
	subscription UserPresence($boardId: ID!) {
		userPresence(boardId: $boardId) {
			userId
			status
		}
	}
`

export const USER_TYPING_SUB = gql`
	subscription UserTyping($boardId: ID!) {
		userTyping(boardId: $boardId) {
			userId
			userName
		}
	}
`
