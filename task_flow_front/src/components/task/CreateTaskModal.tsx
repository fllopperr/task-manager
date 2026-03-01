import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '../../components/ui/select'
import { useModal, useUIActions } from '../../store/ui.store'
import { GET_BOARD } from '../../lib/graphql/board'
import { useCreateTask } from '../../hooks/useCreateTask'
import type { Priority } from '../../types'

export const CreateTaskModal = memo(function CreateTaskModal() {
	const { boardId } = useParams<{ boardId: string }>()
	const { isOpen, data } = useModal('taskCreate')
	const { closeModal } = useUIActions()

	const selectedColumnId = data?.columnId

	const { data: boardData } = useQuery(GET_BOARD, {
		variables: { id: boardId },
		skip: !boardId
	})

	const {
		title,
		setTitle,
		description,
		setDescription,
		priority,
		setPriority,
		columnId,
		setColumnId,
		loading,
		createTask,
		reset
	} = useCreateTask(boardId, selectedColumnId, () => closeModal('taskCreate'))

	const handleClose = () => {
		reset()
		closeModal('taskCreate')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		createTask()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-[500px] p-10 bg-black text-white border-none rounded-[40px] [&>button]:hidden'>
				<DialogTitle className='sr-only'>Создать новую задачу</DialogTitle>

				<div className='flex justify-between items-center mb-8'>
					<h2 className='text-2xl font-black uppercase tracking-tight'>
						Новая задача
					</h2>
					<button
						onClick={handleClose}
						className='p-2 hover:bg-white/10 rounded-full transition-colors'
					>
						<X className='w-8 h-8 stroke-[3px]' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='space-y-2'>
						<label className='text-white text-xs font-black uppercase tracking-widest ml-1'>
							Название задачи
						</label>
						<input
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder='Введите название...'
							className='w-full bg-transparent border-2 border-white rounded-2xl px-6 py-4 outline-none focus:border-white transition-all font-bold placeholder:text-white/50'
							required
							autoFocus
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-white text-xs font-black uppercase tracking-widest ml-1'>
							Описание
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder='Введите описание...'
							className='w-full bg-transparent border-2 border-white rounded-2xl px-6 py-4 min-h-[120px] outline-none focus:border-white transition-all font-bold resize-none placeholder:text-white/50'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-white text-xs font-black uppercase tracking-widest ml-1'>
								Статус
							</label>
							<Select value={columnId} onValueChange={setColumnId}>
								<SelectTrigger className='bg-transparent border-2 border-white h-14 rounded-2xl font-bold text-white [&>span]:text-white'>
									<SelectValue placeholder='Выбрать' />
								</SelectTrigger>
								<SelectContent className='bg-black border-white text-white rounded-xl'>
									{boardData?.board?.columns.map((col: any) => (
										<SelectItem
											key={col.id}
											value={col.id}
											className='focus:bg-white/10'
										>
											{col.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<label className='text-white text-xs font-black uppercase tracking-widest ml-1'>
								Приоритет
							</label>
							<Select
								value={priority}
								onValueChange={v => setPriority(v as Priority)}
							>
								<SelectTrigger className='bg-transparent border-2 border-white h-14 rounded-2xl font-bold text-white'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className='bg-black text-white rounded-xl border-white'>
									<SelectItem value='LOW' className='focus:bg-white/10'>
										Низкий
									</SelectItem>
									<SelectItem value='MEDIUM' className='focus:bg-white/10'>
										Средний
									</SelectItem>
									<SelectItem value='HIGH' className='focus:bg-white/10'>
										Высокий
									</SelectItem>
									<SelectItem value='URGENT' className='focus:bg-white/10'>
										Срочный
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='flex gap-4 pt-6'>
						<button
							type='button'
							onClick={handleClose}
							disabled={loading}
							className='flex-1 border-2 border-white py-4 rounded-2xl font-black uppercase transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50'
						>
							Отмена
						</button>
						<button
							type='submit'
							disabled={loading || !title.trim() || !columnId}
							className='flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'Создание...' : 'Создать'}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
})
