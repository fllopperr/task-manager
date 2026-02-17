import type { GraphQlContext } from '../../lib/context.js'

type PresenceStatus = 'online' | 'offline' | 'away'

function requireAuth(ctx: GraphQlContext): string {
	if (!ctx.userId) throw new Error('Unauthorized')
	return ctx.userId
}

export const subscriptionResolvers = {
	Subscription: {
		// --- Task Events ---
		taskCreated: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskCreated:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_CREATED', boardId)
			},
			resolve: (payload: any) => payload.taskCreated
		},

		taskUpdated: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskUpdated:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_UPDATED', boardId)
			},
			resolve: (payload: any) => payload.taskUpdated
		},

		taskMoved: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				console.log(
					`[Sub] User ${ctx.userId} subscribed to taskMoved:${boardId}`
				)
				return ctx.pubSub.subscribe('TASK_MOVED', boardId)
			},
			resolve: (payload: any) => payload.taskMoved
		},

		taskDeleted: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('TASK_DELETED', boardId)
			},
			resolve: (payload: any) => payload.taskDeleted
		},

		// --- Comment Events ---
		commentAdded: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COMMENT_ADDED', boardId)
			},
			resolve: (payload: any) => payload.commentAdded
		},

		commentUpdated: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COMMENT_UPDATED', boardId)
			},
			resolve: (payload: any) => payload.commentUpdated
		},

		commentDeleted: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COMMENT_DELETED', boardId)
			},
			resolve: (payload: any) => payload.commentDeleted
		},

		// --- Board Member Events ---
		boardMemberAdded: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('BOARD_MEMBER_ADDED', boardId)
			},
			resolve: (payload: any) => payload.boardMemberAdded
		},

		boardMemberRemoved: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('BOARD_MEMBER_REMOVED', boardId)
			},
			resolve: (payload: any) => payload.boardMemberRemoved
		},

		// --- Column Events ---
		columnCreated: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COLUMN_CREATED', boardId)
			},
			resolve: (payload: any) => payload.columnCreated
		},

		columnUpdated: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COLUMN_UPDATED', boardId)
			},
			resolve: (payload: any) => payload.columnUpdated
		},

		columnDeleted: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('COLUMN_DELETED', boardId)
			},
			resolve: (payload: any) => payload.columnDeleted
		},

		// --- Presence & Activity ---
		userPresence: {
			subscribe: (
				_: unknown,
				{ boardId }: { boardId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('USER_PRESENCE', boardId)
			},
			resolve: (payload: any) => payload.userPresence
		},

		userTyping: {
			subscribe: (
				_: unknown,
				{ taskId }: { taskId: string },
				ctx: GraphQlContext
			) => {
				requireAuth(ctx)
				return ctx.pubSub.subscribe('USER_TYPING', taskId)
			},
			resolve: (payload: any) => payload.userTyping
		}
	},

	Mutation: {
		updatePresence: (
			_: unknown,
			{ boardId, status }: { boardId: string; status: PresenceStatus },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			console.log(`[PubSub] User ${userId} is ${status}`)
			ctx.pubSub.publish('USER_PRESENCE', boardId, {
				userPresence: { userId, status }
			})
			return true
		},

		setTyping: async (
			_: unknown,
			{ taskId, isTyping }: { taskId: string; isTyping: boolean },
			ctx: GraphQlContext
		) => {
			const userId = requireAuth(ctx)
			if (!isTyping) return true

			const user = await ctx.prisma.user.findUnique({
				where: { id: userId },
				select: { username: true }
			})

			console.log(`[PubSub] User ${user?.username} is typing`)
			ctx.pubSub.publish('USER_TYPING', taskId, {
				userTyping: {
					userId,
					userName: user?.username ?? 'Anonymous'
				}
			})
			return true
		}
	}
}
