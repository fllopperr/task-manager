import { TaskService } from '../../modules/task/task.service.js'
import type { GraphQlContext } from '../../lib/context.js'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const taskResolvers = {
	Mutation: {
		createTask: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).createTask(
				userId,
				input
			)
		},

		updateTask: (
			_: unknown,
			{ id, input }: { id: string; input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).updateTask(
				id,
				userId,
				input
			)
		},

		moveTask: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).moveTask(
				userId,
				input
			)
		},

		deleteTask: (_: unknown, { id }: { id: string }, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).deleteTask(
				id,
				userId
			)
		}
	},

	Task: {
		owner: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.owner ||
			ctx.prisma.user.findUnique({ where: { id: parent.ownerId } }),

		comments: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.comments ||
			ctx.prisma.comment.findMany({
				where: { taskId: parent.id, deletedAt: null },
				orderBy: { createdAt: 'asc' }
			})
	}
}
