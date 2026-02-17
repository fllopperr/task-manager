import { CommentRepository } from './comment.repository.js'
import { CreateCommentSchema, UpdateCommentSchema } from './comment.schema.js'
import type { PrismaClient } from '../../generated/prisma/index.js'
import type { pubSub } from '../../lib/pubsub.js'

export class CommentService {
	private commentRepo: CommentRepository

	constructor(
		private prisma: PrismaClient,
		private pubSubInstance: typeof pubSub
	) {
		this.commentRepo = new CommentRepository(prisma)
	}

	async createComment(userId: string, rawInput: unknown) {
		const data = CreateCommentSchema.parse(rawInput)
		const comment = await this.commentRepo.create(userId, data)
		const boardId = comment.task.column.boardId

		console.log(`[PubSub] Comment added by user ${userId}`)
		this.pubSubInstance.publish('COMMENT_ADDED', boardId, {
			commentAdded: comment
		})

		return comment
	}

	async updateComment(commentId: string, userId: string, rawInput: unknown) {
		const data = UpdateCommentSchema.parse(rawInput)

		const comment = await this.commentRepo.update(commentId, userId, data)
		const boardId = comment.task.column.boardId

		console.log(`[PubSub] Comment updated by user ${userId}`)
		this.pubSubInstance.publish('COMMENT_UPDATED', boardId, {
			commentUpdated: comment
		})

		return comment
	}

	async deleteComment(commentId: string, userId: string) {
		const comment = await this.commentRepo.softDelete(commentId, userId)
		const boardId = comment.task.column.boardId

		console.log(`[PubSub] Comment deleted by user ${userId}`)
		this.pubSubInstance.publish('COMMENT_DELETED', boardId, {
			commentDeleted: commentId
		})

		return true
	}
}
