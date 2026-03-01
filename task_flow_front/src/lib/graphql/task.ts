import { gql } from '@apollo/client'
import { TASK_FIELDS, USER_FIELDS } from './fragments'

export const CREATE_TASK = gql`
	mutation CreateTask($input: CreateTaskInput!) {
		createTask(input: $input) {
			...TaskFields
		}
	}
	${TASK_FIELDS}
`

export const UPDATE_TASK = gql`
	mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
		updateTask(id: $id, input: $input) {
			...TaskFields
		}
	}
	${TASK_FIELDS}
`

export const MOVE_TASK = gql`
	mutation MoveTask($input: MoveTaskInput!) {
		moveTask(input: $input) {
			id
			columnId
			position
		}
	}
`

export const DELETE_TASK = gql`
	mutation DeleteTask($id: ID!) {
		deleteTask(id: $id)
	}
`
