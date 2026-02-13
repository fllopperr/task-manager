import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/user.repository.js'
import type { Prisma } from '../generated/prisma/index.js'

type UserAuthPayload = {
	id: string
	email: string
	username: string
}

export class AuthService {
	private readonly jwtSecret: string

	private respondWithToken(user: UserAuthPayload) {
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			this.jwtSecret,
			{ expiresIn: '7d' }
		)

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username
			}
		}
	}

	constructor(private userRepo: UserRepository) {
		const secret = process.env.JWT_SECRET
		if (!secret) throw new Error('JWT_SECRET не задан в .env')
		this.jwtSecret = secret
	}

	async register(data: Prisma.UserCreateInput) {
		const existing = await this.userRepo.findByEmail(data.email)
		if (existing) throw new Error('Пользователь с таким email уже существует')
		const hashedPassword = await Bun.password.hash(data.password)

		const user = await this.userRepo.create({
			...data,
			password: hashedPassword
		})

		return this.respondWithToken(user)
	}

	async login({ email, password }: { email?: string; password?: string }) {
		if (!email || !password) throw new Error('Email и пароль обязательны')

		const user = await this.userRepo.findByEmail(email)
		if (!user) throw new Error('Пользователь не найден')

		const isPasswordValid = await Bun.password.verify(password, user.password)
		if (!isPasswordValid) throw new Error('Неверный пароль')

		return this.respondWithToken(user)
	}
}
