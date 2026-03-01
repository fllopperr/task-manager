import { gql } from '@apollo/client'

export const UPDATE_USER_PROFILE = gql`
	mutation UpdateUserProfile($input: UpdateUserInput!) {
		updateUserProfile(input: $input) {
			id
			username
			email
		}
	}
`
