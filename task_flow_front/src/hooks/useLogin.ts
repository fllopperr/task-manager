import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthActions } from '../store/auth.store'
import { useMutation } from '@apollo/client'
import type { AuthResponse } from '../types'
import { LOGIN } from '../lib/graphql/auth'

export function useLogin() {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})
	const [error, setError] = useState('')

	const navigate = useNavigate()
	const { setAuth } = useAuthActions()

	const [login, { loading }] = useMutation<{ login: AuthResponse }>(LOGIN, {
		onCompleted: data => {
			setAuth(data.login.user, data.login.token)
			navigate('/')
		},
		onError: err => {
			setError(
				err.graphQLErrors[0]?.message || 'Ошибка входа. Проверьте данные.'
			)
		}
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
		if (error) setError('')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

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
		error,
		handleChange,
		handleSubmit
	}
}
