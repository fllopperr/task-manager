import jwt from 'jsonwebtoken'
import { UserRepository } from '../user/user.repository.js'
import { LoginSchema, RegisterSchema } from './auth.schema.js'

type UserAuthPayload = {
	id: string
	email: string
	username: string
}

export class AuthService {
	private readonly jwtSecret: string

	constructor(private userRepo: UserRepository) {
		const secret = process.env.JWT_SECRET
		if (!secret) throw new Error('JWT_SECRET не задан в .env')
		this.jwtSecret = secret
	}

	private respondWithToken(user: UserAuthPayload) {
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			this.jwtSecret,
			{ expiresIn: '7d' }
		)
		return { token, user }
	}

	async register(rawInput: unknown) {
		const data = RegisterSchema.parse(rawInput)

		const alreadyExists = await this.userRepo.exists(data.email, data.username)
		if (alreadyExists) {
			throw new Error('Пользователь с таким email или username уже существует')
		}

		const hashedPassword = await Bun.password.hash(data.password)
		const user = await this.userRepo.create({
			email: data.email,
			username: data.username,
			password: hashedPassword
		})

		return this.respondWithToken(user)
	}

	async login(rawInput: unknown) {
		const data = LoginSchema.parse(rawInput)

		const user = await this.userRepo.findByEmail(data.email)
		if (!user) throw new Error('Пользователь не найден')

		const isPasswordValid = await Bun.password.verify(
			data.password,
			user.password
		)
		if (!isPasswordValid) throw new Error('Неверный пароль')

		return this.respondWithToken(user)
	}
}
