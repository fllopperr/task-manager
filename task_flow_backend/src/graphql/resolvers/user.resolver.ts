import { GraphQLError } from 'graphql'
import { UserService } from '../../modules/user/user.service.js'
import type { GraphQlContext } from '../../lib/context.js'

export const userResolvers = {
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
	},
	Mutation: {
		updateUser: async (
			_: unknown,
			{ input }: { input: any },
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) {
				throw new GraphQLError('Unauthorized', {
					extensions: { code: 'UNAUTHENTICATED' }
				})
			}

			const userService = new UserService(ctx.prisma)
			return userService.updateProfile(ctx.userId, input)
		}
	}
}
