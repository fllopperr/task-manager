import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { REGISTER } from '../lib/graphql/auth'
import { useAuthActions } from '../store/auth.store'
import type { AuthResponse } from '../types'

export function useRegister() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [error, setError] = useState('')

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
				setError(err.graphQLErrors[0]?.message || 'Ошибка при регистрации')
			}
		}
	)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
		if (error) setError('')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (formData.password.length < 8) {
			setError('Пароль должен быть не менее 8 символов')
			return
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Пароли не совпадают')
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
		error,
		handleChange,
		handleSubmit
	}
}
