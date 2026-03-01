import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Task } from '../types'

interface ModalState<T = any> {
	isOpen: boolean
	data: T | null
}

interface UIState {
	modals: {
		taskCreate: ModalState<{ columnId: string | null }>
		taskDetail: ModalState<{ task: Task }>
		boardCreate: ModalState<null>
		settings: ModalState<null>
	}

	actions: {
		openModal: <K extends keyof UIState['modals']>(
			modalName: K,
			data?: UIState['modals'][K]['data']
		) => void
		closeModal: (modalName: keyof UIState['modals']) => void
		closeAllModals: () => void
	}
}

export const useUIStore = create<UIState>()(
	persist(
		devtools(
			set => ({
				modals: {
					taskCreate: { isOpen: false, data: null },
					taskDetail: { isOpen: false, data: null },
					boardCreate: { isOpen: false, data: null },
					settings: { isOpen: false, data: null }
				},

				actions: {
					openModal: (name, data = null) =>
						set(
							state => ({
								modals: {
									...Object.keys(state.modals).reduce((acc: any, key) => {
										acc[key] = { isOpen: false, data: null }
										return acc
									}, {}),
									[name]: { isOpen: true, data }
								}
							}),
							false,
							`ui/openModal/${name}`
						),

					closeModal: name =>
						set(
							state => ({
								modals: {
									...state.modals,
									[name]: { isOpen: false, data: null }
								}
							}),
							false,
							`ui/closeModal/${name}`
						),

					closeAllModals: () =>
						set(
							state => {
								const closedModals = { ...state.modals }
								Object.keys(closedModals).forEach(key => {
									;(closedModals as any)[key] = { isOpen: false, data: null }
								})
								return { modals: closedModals }
							},
							false,
							'ui/closeAllModals'
						)
				}
			}),
			{ name: 'UIStore' }
		),
		{
			name: 'ui-storage',
			partialize: state => ({ modals: state.modals })
		}
	)
)

export const useModal = <K extends keyof UIState['modals']>(name: K) =>
	useUIStore(state => state.modals[name])

export const useUIActions = () => useUIStore(state => state.actions)
