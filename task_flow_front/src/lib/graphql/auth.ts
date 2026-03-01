import { gql } from '@apollo/client'

export const USER_FIELDS = gql`
	fragment UserFields on User {
		id
		email
		username
	}
`

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			token
			user {
				...UserFields
			}
		}
	}
	${USER_FIELDS}
`

export const REGISTER = gql`
	mutation Register($input: RegisterInput!) {
		register(input: $input) {
			token
			user {
				...UserFields
			}
		}
	}
	${USER_FIELDS}
`

export const ME = gql`
	query Me {
		me {
			...UserFields
		}
	}
	${USER_FIELDS}
`
