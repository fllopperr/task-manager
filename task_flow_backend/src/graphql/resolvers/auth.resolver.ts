import { AuthService } from '../../modules/auth/auth.service.js'
import { UserRepository } from '../../modules/user/user.repository.js'
import type { GraphQlContext } from '../../lib/context.js'

export const authResolvers = {
	Mutation: {
		login: (_: unknown, { input }: { input: unknown }, ctx: GraphQlContext) =>
			new AuthService(new UserRepository(ctx.prisma)).login(input),

		register: (
			_: unknown,
			{ input }: { input: unknown },
			ctx: GraphQlContext
		) => new AuthService(new UserRepository(ctx.prisma)).register(input)
	}
}
