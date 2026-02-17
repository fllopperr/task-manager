import { authResolvers } from './auth.resolver.js'
import { boardResolvers } from './board.resolver.js'
import { columnResolvers } from './column.resolver.js'
import { taskResolvers } from './task.resolver.js'
import { commentResolvers } from './comment.resolver.js'
import { subscriptionResolvers } from './subscription.resolver.js'
import type { GraphQlContext } from '../../lib/context.js'

const userResolvers = {
	Query: {
		me: async (_: unknown, __: unknown, ctx: GraphQlContext) => {
			if (!ctx.userId) return null
			return ctx.prisma.user.findUnique({
				where: { id: ctx.userId },
				include: { ownedBoards: true }
			})
		},

		users: (_: unknown, __: unknown, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			return ctx.prisma.user.findMany({
				select: { id: true, email: true, username: true },
				orderBy: { username: 'asc' }
			})
		}
	}
}

export const resolvers = {
	Query: {
		...userResolvers.Query,
		...boardResolvers.Query
	},
	Mutation: {
		...authResolvers.Mutation,
		...boardResolvers.Mutation,
		...columnResolvers.Mutation,
		...taskResolvers.Mutation,
		...commentResolvers.Mutation,
		...subscriptionResolvers.Mutation
	},
	Subscription: {
		...subscriptionResolvers.Subscription
	},
	Board: boardResolvers.Board,
	Column: columnResolvers.Column,
	Task: taskResolvers.Task
}
