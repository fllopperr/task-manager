import { gql } from '@apollo/client'

export const USER_FIELDS = gql`
	fragment UserFields on User {
		id
		email
		username
	}
`

export const COLUMN_FIELDS = gql`
	fragment ColumnFields on Column {
		id
		title
		position
		boardId
	}
`

export const COMMENT_FIELDS = gql`
	fragment CommentFields on Comment {
		id
		content
		createdAt
		updatedAt
		taskId
		user {
			...UserFields
		}
	}
	${USER_FIELDS}
`

export const TASK_FIELDS = gql`
	fragment TaskFields on Task {
		id
		title
		description
		position
		priority
		tags
		columnId
		ownerId
		assigneeId
		createdAt
		limitDate
		owner {
			...UserFields
		}
		assignee {
			...UserFields
		}
		comments {
			...CommentFields
		}
	}
	${COMMENT_FIELDS}
`
