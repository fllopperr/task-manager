import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthActions } from '../store/auth.store'
import { useMutation } from '@apollo/client'
import type { AuthResponse } from '../types'
import { LOGIN } from '../lib/graphql/auth'

export type LoginErrors = {
	email?: string
	password?: string
	common?: string
}

export function useLogin() {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})
	const [errors, setErrors] = useState<LoginErrors>({})

	const navigate = useNavigate()
	const { setAuth } = useAuthActions()

	const [login, { loading }] = useMutation<{ login: AuthResponse }>(LOGIN, {
		onCompleted: data => {
			setAuth(data.login.user, data.login.token)
			navigate('/')
		},
		onError: err => {
			const msg = err.graphQLErrors[0]?.message || 'Ошибка входа'

			if (
				msg.toLowerCase().includes('email') ||
				msg.toLowerCase().includes('user not found')
			) {
				setErrors({ email: 'Пользователь с таким email не найден' })
			} else if (msg.toLowerCase().includes('password')) {
				setErrors({ password: 'Неверный пароль' })
			} else {
				setErrors({ common: msg })
			}
		}
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target
		setFormData(prev => ({ ...prev, [id]: value }))
		if (errors[id as keyof LoginErrors] || errors.common) {
			setErrors(prev => ({ ...prev, [id]: undefined, common: undefined }))
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})

		if (!formData.email.trim()) {
			setErrors(prev => ({ ...prev, email: 'Введите email' }))
			return
		}
		if (!formData.password) {
			setErrors(prev => ({ ...prev, password: 'Введите пароль' }))
			return
		}

		login({
			variables: {
				input: {
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
