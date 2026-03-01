import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	split,
	from
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { createClient } from 'graphql-ws'
import { useAuthStore } from '../store/auth.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

const httpLink = new HttpLink({ uri: `${API_URL}/graphql` })

const authLink = setContext((_, { headers }) => {
	const token = useAuthStore.getState().token
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : ''
		}
	}
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, extensions }) => {
			if (extensions?.code === 'UNAUTHENTICATED') {
				useAuthStore.getState().actions.logout()
			}
			console.error(`[GraphQL error]: ${message}`)
		})
	}
	if (networkError) console.error(`[Network error]: ${networkError}`)
})

const wsLink = new GraphQLWsLink(
	createClient({
		url: `${WS_URL}/graphql`,
		connectionParams: () => ({
			authorization: useAuthStore.getState().token
				? `Bearer ${useAuthStore.getState().token}`
				: ''
		}),
		shouldRetry: () => true,
		lazy: true
	})
)

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	wsLink,
	from([errorLink, authLink, httpLink])
)

export const apolloClient = new ApolloClient({
	link: splitLink,
	connectToDevTools: import.meta.env.DEV,
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					boards: {
						merge(existing = [], incoming) {
							return [...incoming]
						}
					}
				}
			},
			Board: {
				fields: {
					columns: {
						merge: false
					}
				}
			},
			Column: {
				fields: {
					tasks: {
						merge: false
					}
				}
			}
		}
	})
})
