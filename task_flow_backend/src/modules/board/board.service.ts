import { BoardRepository } from './board.repository.js'
import { UserRepository } from '../user/user.repository.js'
import { CreateBoardSchema, AddBoardMemberSchema } from './board.schema.js'
import type { PrismaClient } from '../../generated/prisma/index.js'
import type { pubSub } from '../../lib/pubsub.js'

export class BoardService {
	private boardRepo: BoardRepository
	private userRepo: UserRepository

	constructor(
		private prisma: PrismaClient,
		private pubSubInstance: typeof pubSub
	) {
		this.boardRepo = new BoardRepository(prisma)
		this.userRepo = new UserRepository(prisma)
	}

	async getAllBoards(userId: string) {
		return this.boardRepo.findAllAvailable(userId)
	}

	async getBoardById(boardId: string, userId: string) {
		const board = await this.boardRepo.getFullBoardData(boardId, userId)
		if (!board) throw new Error('Board not found or access denied')
		return board
	}

	async createBoard(userId: string, rawInput: unknown) {
		const data = CreateBoardSchema.parse(rawInput)
		return this.boardRepo.create(userId, data)
	}

	async deleteBoard(boardId: string, userId: string) {
		const isOwner = await this.boardRepo.isOwner(boardId, userId)
		if (!isOwner) throw new Error('Only the board owner can delete it')
		await this.boardRepo.delete(boardId, userId)
		return true
	}

	async addMember(userId: string, rawInput: unknown) {
		const data = AddBoardMemberSchema.parse(rawInput)

		const isOwner = await this.boardRepo.isOwner(data.boardId, userId)
		if (!isOwner) throw new Error('Only the board owner can add members')

		const userToInvite = await this.userRepo.findByEmail(data.email)
		if (!userToInvite) throw new Error('User not found')

		const member = await this.boardRepo.addMember(
			data.boardId,
			userToInvite.id,
			data.role
		)

		console.log(`[PubSub] Member added to board ${data.boardId}`)
		this.pubSubInstance.publish('BOARD_MEMBER_ADDED', data.boardId, {
			boardMemberAdded: member
		})

		return member
	}

	async removeMember(
		boardId: string,
		targetUserId: string,
		requesterId: string
	) {
		const isOwner = await this.boardRepo.isOwner(boardId, requesterId)
		if (!isOwner) throw new Error('Only the board owner can remove members')

		await this.boardRepo.removeMember(boardId, targetUserId)

		console.log(`[PubSub] Member removed from board ${boardId}`)
		this.pubSubInstance.publish('BOARD_MEMBER_REMOVED', boardId, {
			boardMemberRemoved: targetUserId
		})

		return true
	}
}
