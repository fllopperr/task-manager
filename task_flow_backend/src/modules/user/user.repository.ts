import type { Prisma, PrismaClient } from '../../generated/prisma/index.js'
import type { UpdateUserInput } from './user.schema.js'

export class UserRepository {
	constructor(private prisma: PrismaClient) {}

	async exists(email: string, username: string) {
		const count = await this.prisma.user.count({
			where: {
				OR: [{ email }, { username }]
			}
		})
		return count > 0
	}

	async create(data: Prisma.UserCreateInput) {
		return this.prisma.user.create({
			data,
			select: {
				id: true,
				email: true,
				username: true
			}
		})
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } })
	}

	async findById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			select: { id: true, email: true, username: true }
		})
	}

	async update(userId: string, data: UpdateUserInput) {
		return this.prisma.user.update({
			where: { id: userId },
			data: {
				username: data.username,
				email: data.email
			},
			select: {
				id: true,
				username: true,
				email: true
			}
		})
	}
}
