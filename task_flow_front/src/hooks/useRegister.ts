import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { REGISTER } from '../lib/graphql/auth'
import { useAuthActions } from '../store/auth.store'
import type { AuthResponse } from '../types'

export type RegisterErrors = {
	username?: string
	email?: string
	password?: string
	confirmPassword?: string
	common?: string
}

export function useRegister() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [errors, setErrors] = useState<RegisterErrors>({})

	const navigate = useNavigate()
	const { setAuth } = useAuthActions()

	const [register, { loading }] = useMutation<{ register: AuthResponse }>(
		REGISTER,
		{
			onCompleted: data => {
				setAuth(data.register.user, data.register.token)
				navigate('/')
			},
			onError: err => {
				const message =
					err.graphQLErrors[0]?.message || 'Ошибка при регистрации'

				if (message.toLowerCase().includes('email')) {
					setErrors({ email: 'Этот email уже занят' })
				} else if (message.toLowerCase().includes('username')) {
					setErrors({ username: 'Имя пользователя занято' })
				} else {
					setErrors({ common: message })
				}
			}
		}
	)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target
		setFormData(prev => ({ ...prev, [id]: value }))

		if (errors[id as keyof RegisterErrors] || errors.common) {
			setErrors(prev => ({ ...prev, [id]: undefined, common: undefined }))
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors: RegisterErrors = {}

		if (!formData.username.trim()) {
			newErrors.username = 'Введите ваше имя'
		}

		if (!formData.email.trim() || !formData.email.includes('@')) {
			newErrors.email = 'Введите корректный email'
		}

		if (formData.password.length < 8) {
			newErrors.password = 'Пароль должен быть не менее 8 символов'
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Пароли не совпадают'
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		register({
			variables: {
				input: {
					username: formData.username.trim(),
					email: formData.email.trim().toLowerCase(),
					password: formData.password
				}
			}
		})
	}

	return {
		formData,
		loading,
		errors,
		handleChange,
		handleSubmit
	}
}
