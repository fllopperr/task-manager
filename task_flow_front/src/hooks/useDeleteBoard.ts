import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { DELETE_BOARD, GET_BOARDS } from '../lib/graphql/board'

export function useDeleteBoard() {
	const navigate = useNavigate()

	const [deleteBoardMutation, { loading }] = useMutation(DELETE_BOARD, {
		refetchQueries: [{ query: GET_BOARDS }],
		onCompleted: () => {
			navigate('/')
		}
	})

	const deleteBoard = (boardId: string, boardTitle: string) => {
		if (
			confirm(
				`Удалить доску "${boardTitle}"?\n\nВсе колонки и задачи будут удалены безвозвратно!`
			)
		) {
			deleteBoardMutation({
				variables: { id: boardId }
			})
		}
	}

	return { deleteBoard, loading }
}
