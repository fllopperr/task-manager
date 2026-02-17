import { PrismaClient } from '../../generated/prisma/index.js'
import type { CreateColumnInput, UpdateColumnInput } from './column.schema.js'

export class ColumnRepository {
	constructor(private prisma: PrismaClient) {}

	async create(ownerId: string, data: CreateColumnInput) {
		return this.prisma.column.create({
			data: { ...data, ownerId }
		})
	}

	async update(columnId: string, data: UpdateColumnInput) {
		return this.prisma.column.update({
			where: { id: columnId },
			data
		})
	}

	async delete(columnId: string) {
		return this.prisma.column.delete({
			where: { id: columnId }
		})
	}

	async findById(columnId: string) {
		return this.prisma.column.findUnique({
			where: { id: columnId }
		})
	}

	// Проверяем что колонка принадлежит доске где юзер имеет доступ
	async isAccessible(columnId: string, userId: string): Promise<boolean> {
		const column = await this.prisma.column.findFirst({
			where: {
				id: columnId,
				board: {
					OR: [{ ownerId: userId }, { members: { some: { userId } } }]
				}
			},
			select: { id: true }
		})
		return column !== null
	}

	async isOwner(columnId: string, userId: string): Promise<boolean> {
		const column = await this.prisma.column.findFirst({
			where: { id: columnId, ownerId: userId },
			select: { id: true }
		})
		return column !== null
	}
}
