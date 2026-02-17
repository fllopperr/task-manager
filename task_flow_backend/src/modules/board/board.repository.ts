import { PrismaClient } from '../../generated/prisma/index.js'
import type { CreateBoardInput } from './board.schema.js'

const DEFAULT_COLUMNS = [
	{ title: 'To Do', position: 65536 },
	{ title: 'In Progress', position: 131072 },
	{ title: 'Done', position: 196608 }
]

export class BoardRepository {
	constructor(private prisma: PrismaClient) {}

	async findAllAvailable(userId: string) {
		return this.prisma.board.findMany({
			where: {
				OR: [{ ownerId: userId }, { members: { some: { userId } } }]
			},
			include: {
				_count: { select: { columns: true } }
			},
			orderBy: { createdAt: 'asc' }
		})
	}

	async findById(boardId: string, userId: string) {
		return this.prisma.board.findFirst({
			where: {
				id: boardId,
				OR: [{ ownerId: userId }, { members: { some: { userId } } }]
			}
		})
	}

	async getFullBoardData(boardId: string, userId: string) {
		return this.prisma.board.findFirst({
			where: {
				id: boardId,
				OR: [{ ownerId: userId }, { members: { some: { userId } } }]
			},
			include: {
				columns: {
					orderBy: { position: 'asc' },
					include: {
						tasks: {
							orderBy: { position: 'asc' },
							include: {
								owner: { select: { id: true, username: true, email: true } }
							}
						}
					}
				}
			}
		})
	}

	async create(userId: string, data: CreateBoardInput) {
		return this.prisma.board.create({
			data: {
				title: data.title,
				icon: data.icon,
				ownerId: userId,
				columns: {
					create: DEFAULT_COLUMNS.map(col => ({
						...col,
						ownerId: userId
					}))
				}
			},
			include: {
				columns: true,
				_count: { select: { columns: true } }
			}
		})
	}

	async delete(boardId: string, ownerId: string) {
		return this.prisma.board.delete({
			where: { id: boardId, ownerId }
		})
	}

	async addMember(boardId: string, userId: string, role: string) {
		return this.prisma.boardMember.create({
			data: { boardId, userId, role },
			include: { user: true, board: true }
		})
	}

	async removeMember(boardId: string, userId: string) {
		return this.prisma.boardMember.delete({
			where: { userId_boardId: { userId, boardId } }
		})
	}

	async isMemberOrOwner(boardId: string, userId: string): Promise<boolean> {
		const board = await this.prisma.board.findFirst({
			where: {
				id: boardId,
				OR: [{ ownerId: userId }, { members: { some: { userId } } }]
			},
			select: { id: true }
		})
		return board !== null
	}

	async isOwner(boardId: string, userId: string): Promise<boolean> {
		const board = await this.prisma.board.findFirst({
			where: { id: boardId, ownerId: userId },
			select: { id: true }
		})
		return board !== null
	}
}
