import { CommentService } from '../../modules/comment/comment.service.js'
import type { GraphQlContext } from '../../lib/context.js'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const commentResolvers = {
	Mutation: {
		createComment: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new CommentService(ctx.prisma, ctx.pubSub).createComment(
				userId,
				input
			)
		},

		updateComment: (
			_: unknown,
			{ id, input }: { id: string; input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new CommentService(ctx.prisma, ctx.pubSub).updateComment(
				id,
				userId,
				input
			)
		},

		deleteComment: (
			_: unknown,
			{ id }: { id: string },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new CommentService(ctx.prisma, ctx.pubSub).deleteComment(
				id,
				userId
			)
		}
	}
}
