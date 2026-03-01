import { UserRepository } from './user.repository.js'
import { UpdateUserSchema, type UpdateUserInput } from './user.schema.js'
import type { PrismaClient } from '../../generated/prisma/index.js'

export class UserService {
	private userRepo: UserRepository

	constructor(private prisma: PrismaClient) {
		this.userRepo = new UserRepository(prisma)
	}

	async updateProfile(userId: string, rawInput: unknown) {
		const data = UpdateUserSchema.parse(rawInput)

		if (data.email) {
			const existing = await this.userRepo.findByEmail(data.email)
			if (existing && existing.id !== userId) {
				throw new Error('Email уже используется')
			}
		}

		return this.userRepo.update(userId, data)
	}
}
