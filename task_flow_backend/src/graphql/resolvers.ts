import { TaskRepository } from '../repositories/task.repository.js'
import { BoardRepository } from '../repositories/board.repository.js'
import { StatsService } from '../services/stats.service.js'
import { UserRepository } from '../repositories/user.repository.js'
import { AuthService } from '../services/auth.service.js'
import type { GraphQlContext } from '../lib/prisma.js'

export const resolvers = {
	Query: {
		me: async (_: unknown, __: unknown, ctx: GraphQlContext) => {
			if (!ctx.userId) return null
			return ctx.prisma.user.findUnique({
				where: { id: ctx.userId },
				include: { ownedBoards: true }
			})
		},

		users: async (_: unknown, __: unknown, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			return ctx.prisma.user.findMany({ orderBy: { username: 'asc' } })
		},

		boards: async (_: unknown, __: unknown, ctx: GraphQlContext) => {
			if (!ctx.userId) return []
			return new BoardRepository(ctx.prisma).findAllAvailable(ctx.userId)
		},

		board: async (_: unknown, { id }: { id: string }, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const board = await new BoardRepository(ctx.prisma).getFullBoardData(
				id,
				ctx.userId
			)
			if (!board) throw new Error('Board not found or access denied')
			return board
		},

		boardStats: async (
			_: unknown,
			{ boardId }: { boardId: string },
			ctx: GraphQlContext
		) => {
			const statsService = new StatsService(ctx.prisma, ctx.redis)
			return statsService.getBoardStats(boardId)
		}
	},

	Mutation: {
		// --- AUTH ---
		login: (_: any, { input }: any, ctx: GraphQlContext) =>
			new AuthService(new UserRepository(ctx.prisma)).login(input),

		register: (_: any, { input }: any, ctx: GraphQlContext) =>
			new AuthService(new UserRepository(ctx.prisma)).register(input),

		// --- BOARDS ---
		createBoard: (_: any, { input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			return new BoardRepository(ctx.prisma).create(ctx.userId, input)
		},

		deleteBoard: async (
			_: any,
			{ id }: { id: string },
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			await ctx.prisma.board.delete({ where: { id, ownerId: ctx.userId } })
			return true
		},

		addBoardMember: async (
			_: any,
			{ boardId, email, role }: any,
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')

			const userToInvite = await ctx.prisma.user.findUnique({
				where: { email }
			})
			if (!userToInvite) throw new Error('User not found')

			const member = await ctx.prisma.boardMember.create({
				data: { boardId, userId: userToInvite.id, role: role || 'MEMBER' },
				include: { user: true }
			})

			console.log(`[PubSub] Member added to board ${boardId}`)
			ctx.pubSub.publish('BOARD_MEMBER_ADDED', boardId, {
				boardMemberAdded: member
			})
			return member
		},

		removeBoardMember: async (
			_: any,
			{ boardId, userId: mId }: any,
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			await ctx.prisma.boardMember.delete({
				where: { userId_boardId: { userId: mId, boardId } }
			})

			console.log(`[PubSub] Member removed from board ${boardId}`)
			ctx.pubSub.publish('BOARD_MEMBER_REMOVED', boardId, {
				boardMemberRemoved: mId
			})
			return true
		},

		// --- COLUMNS ---
		createColumn: async (_: any, { input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const column = await ctx.prisma.column.create({
				data: { ...input, ownerId: ctx.userId }
			})
			console.log(`[PubSub] Column created by user ${ctx.userId}`)
			ctx.pubSub.publish('COLUMN_CREATED', input.boardId, {
				columnCreated: column
			})
			return column
		},

		updateColumn: async (_: any, { id, input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const updated = await ctx.prisma.column.update({
				where: { id },
				data: input
			})
			console.log(`[PubSub] Column updated by user ${ctx.userId}`)
			ctx.pubSub.publish('COLUMN_UPDATED', updated.boardId, {
				columnUpdated: updated
			})
			return updated
		},

		deleteColumn: async (
			_: any,
			{ id }: { id: string },
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const deleted = await ctx.prisma.column.delete({ where: { id } })
			console.log(`[PubSub] Column deleted by user ${ctx.userId}`)
			ctx.pubSub.publish('COLUMN_DELETED', deleted.boardId, {
				columnDeleted: id
			})
			return true
		},

		// --- TASKS ---
		createTask: async (_: any, { input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const newTask = await new TaskRepository(ctx.prisma).create({
				...input,
				ownerId: ctx.userId
			})

			// Нам нужен boardId для PubSub и Stats
			const column = await ctx.prisma.column.findUnique({
				where: { id: input.columnId }
			})
			const boardId = column!.boardId

			await new StatsService(ctx.prisma, ctx.redis).invalidateCache(boardId)
			console.log(`[PubSub] Task created by user ${ctx.userId}`)
			ctx.pubSub.publish('TASK_CREATED', boardId, { taskCreated: newTask })
			return newTask
		},

		updateTask: async (_: any, { id, input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const updated = await ctx.prisma.task.update({
				where: { id },
				data: input,
				include: { column: true, owner: true }
			})
			const boardId = updated.column.boardId
			await new StatsService(ctx.prisma, ctx.redis).invalidateCache(boardId)
			console.log(`[PubSub] Task updated by user ${ctx.userId}`)
			ctx.pubSub.publish('TASK_UPDATED', boardId, { taskUpdated: updated })
			return updated
		},

		moveTask: async (_: any, { input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const updated = await new TaskRepository(ctx.prisma).updatePosition(
				input.taskId,
				input.newColumnId,
				input.newPosition
			)
			const boardId = updated.column.boardId

			await new StatsService(ctx.prisma, ctx.redis).invalidateCache(boardId)
			console.log(`[PubSub] Task moved by user ${ctx.userId}`)
			ctx.pubSub.publish('TASK_MOVED', boardId, { taskMoved: updated })
			ctx.pubSub.publish('TASK_UPDATED', boardId, { taskUpdated: updated })
			return updated
		},

		deleteTask: async (_: any, { id }: { id: string }, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const deleted = await new TaskRepository(ctx.prisma).delete(id)
			const boardId = deleted.column.boardId

			await new StatsService(ctx.prisma, ctx.redis).invalidateCache(boardId)
			console.log(`[PubSub] Task deleted by user ${ctx.userId}`)
			ctx.pubSub.publish('TASK_DELETED', boardId, { taskDeleted: id })
			return true
		},

		// --- COMMENTS ---
		createComment: async (_: any, { input }: any, ctx: GraphQlContext) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const comment = await ctx.prisma.comment.create({
				data: { ...input, userId: ctx.userId },
				include: { user: true, task: { include: { column: true } } }
			})
			const boardId = comment.task.column.boardId
			console.log(`[PubSub] Comment added by user ${ctx.userId}`)
			ctx.pubSub.publish('COMMENT_ADDED', boardId, { commentAdded: comment })
			return comment
		},

		deleteComment: async (
			_: any,
			{ id }: { id: string },
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			const comment = await ctx.prisma.comment.update({
				where: { id, userId: ctx.userId },
				data: { deletedAt: new Date() },
				include: { task: { include: { column: true } } }
			})
			const boardId = comment.task.column.boardId
			console.log(`[PubSub] Comment deleted by user ${ctx.userId}`)
			ctx.pubSub.publish('COMMENT_DELETED', boardId, { commentDeleted: id })
			return true
		},

		updatePresence: async (
			_: any,
			{ boardId, status }: any,
			ctx: GraphQlContext
		) => {
			if (!ctx.userId) throw new Error('Unauthorized')
			console.log(`[PubSub] User ${ctx.userId} is ${status}`)
			ctx.pubSub.publish('USER_PRESENCE', boardId, {
				userPresence: { userId: ctx.userId, status }
			})
			return true
		},

		setTyping: async (
			_: any,
			{ taskId, isTyping }: any,
			ctx: GraphQlContext
		) => {
			if (!ctx.userId || !isTyping) return true
			const user = await ctx.prisma.user.findUnique({
				where: { id: ctx.userId }
			})
			console.log(`[PubSub] User ${user?.username} is typing`)
			ctx.pubSub.publish('USER_TYPING', taskId, {
				userTyping: {
					userId: ctx.userId,
					userName: user?.username || 'Anonymous'
				}
			})
			return true
		}
	},

	Subscription: {
		taskCreated: {
			subscribe: (_: any, { boardId }: any, ctx: GraphQlContext) => {
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskCreated:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_CREATED', boardId)
			},
			resolve: (p: any) => p.taskCreated
		},
		taskUpdated: {
			subscribe: (_: any, { boardId }: any, ctx: GraphQlContext) => {
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskUpdated:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_UPDATED', boardId)
			},
			resolve: (p: any) => p.taskUpdated
		},
		taskMoved: {
			subscribe: (_: any, { boardId }: any, ctx: GraphQlContext) => {
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskMoved:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_MOVED', boardId)
			},
			resolve: (p: any) => p.taskMoved
		},
		taskDeleted: {
			subscribe: (_: any, { boardId }: any, ctx: any) =>
				ctx.pubSub.subscribe('TASK_DELETED', boardId),
			resolve: (p: any) => p.taskDeleted
		},
		commentAdded: {
			subscribe: (_: any, { boardId }: any, ctx: any) =>
				ctx.pubSub.subscribe('COMMENT_ADDED', boardId),
			resolve: (p: any) => p.commentAdded
		},
		columnCreated: {
			subscribe: (_: any, { boardId }: any, ctx: any) =>
				ctx.pubSub.subscribe('COLUMN_CREATED', boardId),
			resolve: (p: any) => p.columnCreated
		},
		userPresence: {
			subscribe: (_: any, { boardId }: any, ctx: any) =>
				ctx.pubSub.subscribe('USER_PRESENCE', boardId),
			resolve: (p: any) => p.userPresence
		},
		userTyping: {
			subscribe: (_: any, { taskId }: any, ctx: any) =>
				ctx.pubSub.subscribe('USER_TYPING', taskId),
			resolve: (p: any) => p.userTyping
		}
	},

	Board: {
		columns: (p: any, _: any, ctx: any) =>
			p.columns ||
			ctx.prisma.column.findMany({
				where: { boardId: p.id },
				orderBy: { position: 'asc' }
			}),
		members: (p: any, _: any, ctx: any) =>
			p.members ||
			ctx.prisma.boardMember.findMany({
				where: { boardId: p.id },
				include: { user: true }
			}),
		owner: (p: any, _: any, ctx: any) =>
			p.owner || ctx.prisma.user.findUnique({ where: { id: p.ownerId } }),
		_count: (p: any, _: any, ctx: any) => ({
			columns: ctx.prisma.column.count({ where: { boardId: p.id } }),
			tasks: ctx.prisma.task.count({ where: { column: { boardId: p.id } } })
		})
	},

	Column: {
		tasks: (p: any, _: any, ctx: any) =>
			p.tasks ||
			ctx.prisma.task.findMany({
				where: { columnId: p.id },
				orderBy: { position: 'asc' }
			})
	},

	Task: {
		owner: (p: any, _: any, ctx: any) =>
			p.owner || ctx.prisma.user.findUnique({ where: { id: p.ownerId } }),
		comments: (p: any, _: any, ctx: any) =>
			p.comments ||
			ctx.prisma.comment.findMany({
				where: { taskId: p.id, deletedAt: null },
				orderBy: { createdAt: 'asc' }
			})
	}
}
