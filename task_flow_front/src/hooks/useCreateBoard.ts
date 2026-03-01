import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { CREATE_BOARD, GET_BOARDS } from '../lib/graphql/board'

export function useCreateBoard(onSuccess?: () => void) {
	const [title, setTitle] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const [createBoardMutation, { loading }] = useMutation(CREATE_BOARD, {
		refetchQueries: [{ query: GET_BOARDS }],
		onCompleted: data => {
			setTitle('')
			setError('')
			onSuccess?.()
			navigate(`/board/${data.createBoard.id}`)
		},
		onError: err => setError(err.message)
	})

	const createBoard = (boardTitle: string) => {
		if (!boardTitle.trim()) return

		createBoardMutation({
			variables: {
				input: { title: boardTitle.trim() }
			}
		})
	}

	const reset = () => {
		setTitle('')
		setError('')
	}

	return { title, setTitle, error, loading, createBoard, reset }
}
