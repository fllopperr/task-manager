import { ColumnService } from '../../modules/column/column.service.js'
import type { GraphQlContext } from '../../lib/context.js'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const columnResolvers = {
	Mutation: {
		createColumn: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new ColumnService(ctx.prisma, ctx.pubSub).createColumn(
				userId,
				input
			)
		},

		updateColumn: (
			_: unknown,
			{ id, input }: { id: string; input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new ColumnService(ctx.prisma, ctx.pubSub).updateColumn(
				id,
				userId,
				input
			)
		},

		deleteColumn: (_: unknown, { id }: { id: string }, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new ColumnService(ctx.prisma, ctx.pubSub).deleteColumn(id, userId)
		}
	},

	Column: {
		tasks: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.tasks ||
			ctx.prisma.task.findMany({
				where: { columnId: parent.id },
				orderBy: { position: 'asc' }
			})
	}
}
