import type { Prisma, PrismaClient } from '../../generated/prisma/index.js'

export class UserRepository {
	constructor(private prisma: PrismaClient) {}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } })
	}

	async findById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			select: { id: true, email: true, username: true }
		})
	}

	async findMany() {
		return this.prisma.user.findMany({
			select: { id: true, email: true, username: true },
			orderBy: { username: 'asc' }
		})
	}

	async create(data: Prisma.UserCreateInput) {
		return this.prisma.user.create({
			data,
			select: { id: true, email: true, username: true }
		})
	}

	async exists(email: string, username: string): Promise<boolean> {
		const count = await this.prisma.user.count({
			where: { OR: [{ email }, { username }] }
		})
		return count > 0
	}
}
