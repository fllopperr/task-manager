import { BoardService } from '../../modules/board/board.service.js'
import { StatsService } from '../../modules/stats/stats.service.js'
import type { GraphQlContext } from '../../lib/context.js'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const boardResolvers = {
	Query: {
		boards: (_: unknown, __: unknown, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).getAllBoards(userId)
		},

		board: (_: unknown, { id }: { id: string }, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).getBoardById(id, userId)
		},

		boardStats: (
			_: unknown,
			{ boardId }: { boardId: string },
			ctx: GraphQlContext
		) => {
			requireAuth(ctx)
			return new StatsService(ctx.prisma, ctx.redis).getBoardStats(boardId)
		}
	},

	Mutation: {
		createBoard: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).createBoard(userId, input)
		},

		deleteBoard: (_: unknown, { id }: { id: string }, ctx: GraphQlContext) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).deleteBoard(id, userId)
		},

		addBoardMember: (
			_: unknown,
			{
				boardId,
				email,
				role
			}: { boardId: string; email: string; role?: string },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).addMember(userId, {
				boardId,
				email,
				role
			})
		},

		removeBoardMember: (
			_: unknown,
			{ boardId, userId: targetId }: { boardId: string; userId: string },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			return new BoardService(ctx.prisma, ctx.pubSub).removeMember(
				boardId,
				targetId,
				userId
			)
		}
	},

	Board: {
		columns: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.columns ||
			ctx.prisma.column.findMany({
				where: { boardId: parent.id },
				orderBy: { position: 'asc' }
			}),

		members: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.members ||
			ctx.prisma.boardMember.findMany({
				where: { boardId: parent.id },
				include: { user: true }
			}),

		owner: (parent: any, _: unknown, ctx: GraphQlContext) =>
			parent.owner ||
			ctx.prisma.user.findUnique({ where: { id: parent.ownerId } }),

		_count: (parent: any, _: unknown, ctx: GraphQlContext) => ({
			columns: ctx.prisma.column.count({ where: { boardId: parent.id } }),
			tasks: ctx.prisma.task.count({
				where: { column: { boardId: parent.id } }
			})
		})
	}
}
