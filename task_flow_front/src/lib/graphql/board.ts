import { gql } from '@apollo/client'
import { USER_FIELDS, TASK_FIELDS } from './fragments'

export const GET_BOARDS = gql`
	query GetBoards {
		boards {
			id
			title
			icon
			_count {
				columns
				tasks
			}
		}
	}
`

export const GET_BOARD = gql`
	query GetBoard($id: ID!) {
		board(id: $id) {
			id
			title
			icon
			owner {
				...UserFields
			}
			columns {
				id
				title
				position
				tasks {
					...TaskFields
				}
			}
			members {
				id
				role
				user {
					...UserFields
				}
			}
		}
	}
	${TASK_FIELDS}
	${USER_FIELDS}
`

export const CREATE_BOARD = gql`
	mutation CreateBoard($input: CreateBoardInput!) {
		createBoard(input: $input) {
			id
			title
			icon
			_count {
				columns
				tasks
			}
		}
	}
`

export const DELETE_BOARD = gql`
	mutation DeleteBoard($id: ID!) {
		deleteBoard(id: $id)
	}
`
