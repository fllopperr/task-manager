import { PrismaClient, Prisma } from '../generated/prisma/index.js'

export class BoardRepository {
	constructor(private prisma: PrismaClient) {}

	// Теперь находит и свои, и общие доски
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

	async create(userId: string, data: Prisma.BoardCreateWithoutOwnerInput) {
		return this.prisma.board.create({
			data: {
				title: data.title,
				icon: data.icon,
				ownerId: userId,
				columns: {
					create: [
						{ title: 'To Do', position: 65536, ownerId: userId },
						{ title: 'In Progress', position: 131072, ownerId: userId },
						{ title: 'Done', position: 196608, ownerId: userId }
					]
				}
			},
			include: {
				columns: true,
				_count: { select: { columns: true } }
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
}
