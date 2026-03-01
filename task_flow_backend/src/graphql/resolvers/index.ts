import { authResolvers } from './auth.resolver.js'
import { boardResolvers } from './board.resolver.js'
import { columnResolvers } from './column.resolver.js'
import { taskResolvers } from './task.resolver.js'
import { commentResolvers } from './comment.resolver.js'
import { subscriptionResolvers } from './subscription.resolver.js'
import { userResolvers } from './user.resolver.js'

export const resolvers = {
	Query: {
		...userResolvers.Query,
		...boardResolvers.Query
	},
	Mutation: {
		...authResolvers.Mutation,
		...userResolvers.Mutation,
		...boardResolvers.Mutation,
		...columnResolvers.Mutation,
		...taskResolvers.Mutation,
		...commentResolvers.Mutation,
		...subscriptionResolvers.Mutation
	},
	Subscription: subscriptionResolvers.Subscription,

	Board: boardResolvers.Board,
	Column: columnResolvers.Column,
	Task: taskResolvers.Task,
	User: {
		boards: (parent: any) => parent.ownedBoards || []
	}
}
