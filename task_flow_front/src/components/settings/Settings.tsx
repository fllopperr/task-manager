import { useState, useEffect } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { useMutation, gql } from '@apollo/client'
import { Sidebar } from '../../components/layout/Sidebar'
import { useAuthStore, useAuthActions } from '../../store/auth.store'

export const UPDATE_USER_PROFILE = gql`
	mutation UpdateUser($input: UpdateUserInput!) {
		updateUser(input: $input) {
			id
			username
			email
		}
	}
`

type SettingsTab = 'profile' | 'theme'

export function SettingsPage() {
	const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
	const user = useAuthStore(s => s.user)
	const { updateUser } = useAuthActions()

	const [name, setName] = useState(user?.username || '')
	const [email, setEmail] = useState(user?.email || '')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)

	useEffect(() => {
		if (user) {
			setName(user.username)
			setEmail(user.email)
		}
	}, [user])

	const [updateProfile, { loading }] = useMutation(UPDATE_USER_PROFILE, {
		onCompleted: data => {
			updateUser(data.updateUser)
			setSuccess(true)
			setError('')
			setTimeout(() => setSuccess(false), 3000)
		},
		onError: err => {
			setError(err.message)
			setSuccess(false)
		}
	})

	const hasChanges = name !== user?.username || email !== user?.email

	const handleSave = async () => {
		if (!name.trim() || !email.trim()) {
			setError('Поля не могут быть пустыми')
			return
		}

		if (!hasChanges) {
			setError('Нет изменений для сохранения')
			return
		}

		setError('')

		try {
			await updateProfile({
				variables: {
					input: {
						...(name !== user?.username && { username: name }),
						...(email !== user?.email && { email: email })
					}
				}
			})
		} catch (err) {}
	}

	const handleCancel = () => {
		setName(user?.username || '')
		setEmail(user?.email || '')
		setError('')
		setSuccess(false)
	}

	return (
		<div className='flex h-screen bg-[#0B0D10] p-4 overflow-hidden'>
			<Sidebar />

			<div className='flex-1 ml-4 bg-[#0B0D10] rounded-[32px] overflow-hidden p-12'>
				<div className='flex items-center justify-between mb-12'>
					<h1 className='text-[32px] font-bold text-white'>Настройки</h1>
					<button
						onClick={() => window.history.back()}
						className='p-2 hover:bg-white/5 rounded-full transition-colors'
					>
						<X className='w-8 h-8 text-white' strokeWidth={2} />
					</button>
				</div>

				<div className='flex gap-8'>
					{/* Sidebar Tabs */}
					<div className='w-[300px] bg-white rounded-[24px] p-6 h-fit'>
						<button
							onClick={() => setActiveTab('profile')}
							className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
								activeTab === 'profile'
									? 'bg-black text-white'
									: 'text-black hover:bg-gray-100'
							}`}
						>
							<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
								<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
							</svg>
							<span className='text-[16px] font-semibold'>Профиль</span>
						</button>

						<button
							onClick={() => setActiveTab('theme')}
							className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors mt-2 ${
								activeTab === 'theme'
									? 'bg-black text-white'
									: 'text-black hover:bg-gray-100'
							}`}
						>
							<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
								<path d='M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' />
							</svg>
							<span className='text-[16px] font-semibold'>Тема</span>
						</button>
					</div>

					<div className='flex-1 bg-white rounded-[24px] p-8'>
						{activeTab === 'profile' && (
							<div className='max-w-[600px]'>
								<h2 className='text-[24px] font-bold text-black mb-8'>
									Информация профиля
								</h2>

								{success && (
									<div className='mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3'>
										<Check className='w-5 h-5 text-green-600' />
										<p className='text-green-700 font-semibold'>
											Профиль успешно обновлён!
										</p>
									</div>
								)}

								{error && (
									<div className='mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl'>
										<p className='text-red-700 font-semibold'>{error}</p>
									</div>
								)}

								<div className='mb-6'>
									<label className='block text-[14px] font-semibold text-black mb-2'>
										Имя
									</label>
									<input
										type='text'
										value={name}
										onChange={e => setName(e.target.value)}
										disabled={loading}
										className='w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[16px] text-black outline-none focus:border-black transition-colors disabled:opacity-50'
										placeholder='Введите имя'
									/>
								</div>

								<div className='mb-6'>
									<label className='block text-[14px] font-semibold text-black mb-2'>
										Email
									</label>
									<input
										type='email'
										value={email}
										onChange={e => setEmail(e.target.value)}
										disabled={loading}
										className='w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[16px] text-black outline-none focus:border-black transition-colors disabled:opacity-50'
										placeholder='example@mail.com'
									/>
								</div>

								<div className='mb-8'>
									<label className='block text-[14px] font-semibold text-black mb-3'>
										Аватар
									</label>
									<div className='flex items-center gap-4'>
										<div className='w-16 h-16 bg-black rounded-full flex items-center justify-center relative overflow-hidden'>
											<div className='absolute top-2.5 w-5 h-5 bg-white rounded-full' />
											<div className='absolute bottom-[-2px] w-10 h-6 bg-white rounded-t-full' />
										</div>
										<button
											disabled={loading}
											className='px-6 py-2.5 bg-black text-white rounded-xl font-semibold text-[14px] hover:bg-gray-900 transition-colors disabled:opacity-50'
										>
											Изменить фото
										</button>
									</div>
								</div>

								<div className='flex gap-4 pt-6'>
									<button
										onClick={handleCancel}
										disabled={loading || !hasChanges}
										className='px-8 py-3 bg-black text-white rounded-xl font-semibold text-[16px] hover:bg-gray-900 transition-colors disabled:opacity-50'
									>
										Отмена
									</button>
									<button
										onClick={handleSave}
										disabled={loading || !hasChanges}
										className='px-8 py-3 bg-white text-black border-2 border-black rounded-xl font-semibold text-[16px] hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2'
									>
										{loading && <Loader2 className='w-5 h-5 animate-spin' />}
										Сохранить
									</button>
								</div>
							</div>
						)}

						{activeTab === 'theme' && (
							<div className='max-w-[600px]'>
								<h2 className='text-[24px] font-bold text-black mb-8'>
									Настройки темы
								</h2>
								<div className='space-y-4'>
									<button className='w-full flex items-center justify-between px-6 py-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors'>
										<div className='flex items-center gap-3'>
											<div className='w-6 h-6 bg-white rounded-full border-2 border-black' />
											<span className='text-[16px] font-semibold text-black'>
												Светлая тема
											</span>
										</div>
										<div className='w-6 h-6 rounded-full bg-black' />
									</button>
									<button className='w-full flex items-center justify-between px-6 py-4 bg-black rounded-xl hover:bg-gray-900 transition-colors text-white'>
										<div className='flex items-center gap-3'>
											<div className='w-6 h-6 bg-black rounded-full border-2 border-white' />
											<span className='text-[16px] font-semibold'>
												Темная тема
											</span>
										</div>
										<div className='w-6 h-6 rounded-full bg-white' />
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
