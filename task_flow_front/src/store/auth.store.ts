import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
	user: User | null
	token: string | null
	_hasHydrated: boolean

	actions: {
		setAuth: (user: User, token: string) => void
		logout: (apolloClient?: any) => Promise<void>
		updateUser: (user: Partial<User>) => void
		setHasHydrated: (state: boolean) => void
	}
}

export const useAuthStore = create<AuthState>()(
	devtools(
		persist(
			set => ({
				user: null,
				token: null,
				_hasHydrated: false,

				actions: {
					setHasHydrated: state => set({ _hasHydrated: state }),

					setAuth: (user, token) => set({ user, token }, false, 'auth/setAuth'),

					logout: async apolloClient => {
						set({ user: null, token: null }, false, 'auth/logout')
						if (apolloClient) {
							await apolloClient.clearStore()
						}
					},

					updateUser: updatedFields =>
						set(
							state => ({
								user: state.user ? { ...state.user, ...updatedFields } : null
							}),
							false,
							'auth/updateUser'
						)
				}
			}),
			{
				name: 'task-flow-auth',
				storage: createJSONStorage(() => localStorage),
				onRehydrateStorage: () => state => {
					state?.actions.setHasHydrated(true)
				},
				partialize: state => ({
					token: state.token,
					user: state.user
				})
			}
		),
		{ name: 'AuthStore' }
	)
)

export const useUser = () => useAuthStore(s => s.user)
export const useToken = () => useAuthStore(s => s.token)
export const useIsAuthenticated = () => useAuthStore(s => !!s.token)
export const useAuthActions = () => useAuthStore(s => s.actions)
