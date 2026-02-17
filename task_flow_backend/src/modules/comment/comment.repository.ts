import { PrismaClient } from '../../generated/prisma/index.js'
import type {
	CreateCommentInput,
	UpdateCommentInput
} from './comment.schema.js'

export class CommentRepository {
	constructor(private prisma: PrismaClient) {}

	async create(userId: string, data: CreateCommentInput) {
		return this.prisma.comment.create({
			data: {
				content: data.content,
				taskId: data.taskId,
				userId,
				ownerId: userId
			},
			include: {
				user: { select: { id: true, username: true, email: true } },
				task: { include: { column: { select: { boardId: true } } } }
			}
		})
	}

	async update(commentId: string, userId: string, data: UpdateCommentInput) {
		return this.prisma.comment.update({
			where: { id: commentId, userId },
			data: { content: data.content },
			include: {
				user: { select: { id: true, username: true, email: true } },
				task: { include: { column: { select: { boardId: true } } } }
			}
		})
	}

	// Мягкое удаление через deletedAt
	async softDelete(commentId: string, userId: string) {
		return this.prisma.comment.update({
			where: { id: commentId, userId },
			data: { deletedAt: new Date() },
			include: {
				task: { include: { column: { select: { boardId: true } } } }
			}
		})
	}

	async findById(commentId: string) {
		return this.prisma.comment.findUnique({
			where: { id: commentId }
		})
	}
}
