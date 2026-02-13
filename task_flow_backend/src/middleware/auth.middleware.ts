import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
	userId: string
	email: string
}

export const verifyToken = (token: string | undefined): JwtPayload | null => {
	if (!token) return null

	try {
		const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token

		return jwt.verify(cleanToken, JWT_SECRET) as JwtPayload
	} catch (error) {
		return null
	}
}
