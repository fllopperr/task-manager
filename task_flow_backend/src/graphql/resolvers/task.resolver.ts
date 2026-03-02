import { TaskService } from '../../modules/task/task.service.js'
import type { GraphQlContext } from '../../lib/context.js'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const taskResolvers = {
	Mutation: {
		createTask: (_: any, { input }: any, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).createTask(
				userId,
				input
			)
		},
		updateTask: (_: any, { id, input }: any, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).updateTask(
				id,
				userId,
				input
			)
		},
		moveTask: (_: any, { input }: any, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).moveTask(
				userId,
				input
			)
		},
		deleteTask: (_: any, { id }: any, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new TaskService(ctx.prisma, ctx.redis, ctx.pubSub).deleteTask(
				id,
				userId
			)
		}
	},

	Task: {
		owner: (parent: any, _: any, ctx: GraphQlContext) =>
			parent.owner ||
			ctx.prisma.user.findUnique({ where: { id: parent.ownerId } }),

		assignee: (parent: any, _: any, ctx: GraphQlContext) => {
			if (parent.assignee) return parent.assignee
			if (!parent.assigneeId) return null
			return ctx.prisma.user.findUnique({ where: { id: parent.assigneeId } })
		},

		comments: (parent: any, _: any, ctx: GraphQlContext) =>
			parent.comments ||
			ctx.prisma.comment.findMany({
				where: { taskId: parent.id, deletedAt: null },
				orderBy: { createdAt: 'asc' }
			})
	}
}
