import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { X, Clock, Trash2 } from 'lucide-react'
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
import { useTaskUpdate } from '../../hooks/usetaskUpdate'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { formatDate } from '../../lib/utils'
import { ALL_TAGS } from '../../constants/constants'

export const TaskDetailModal = memo(function TaskDetailModal() {
	const { boardId } = useParams<{ boardId: string }>()
	const { isOpen, data: modalData } = useModal('taskDetail')
	const { closeModal } = useUIActions()

	const taskId = modalData?.task?.id

	const { data: boardData } = useQuery(GET_BOARD, {
		variables: { id: boardId },
		skip: !boardId || !isOpen
	})

	const task = boardData?.board?.columns
		?.flatMap((col: any) => col.tasks)
		.find((t: any) => t.id === taskId)

	const {
		localTitle,
		setLocalTitle,
		localDesc,
		setLocalDesc,
		newComment,
		setNewComment,
		handleUpdate,
		handleDelete,
		toggleTag
	} = useTaskUpdate(task, boardId, () => closeModal('taskDetail'))

	const { parseSafeDate, getSafeDateValue } = useDateFormatter()

	if (!isOpen || !task) return null

	return (
		<Dialog open={isOpen} onOpenChange={() => closeModal('taskDetail')}>
			<DialogContent className='max-w-[780px] bg-[#0A0A0A] text-white border border-white/10 rounded-[28px] p-10 shadow-2xl [&>button]:hidden overflow-y-auto max-h-[90vh]'>
				<DialogTitle className='hidden'>Детали задачи</DialogTitle>

				<header className='flex justify-between items-start mb-8'>
					<div className='flex-1 pr-8'>
						<p className='text-[13px] text-[#8C939A] mb-1 font-medium uppercase tracking-wide'>
							Редактирование задачи
						</p>
						<input
							type='text'
							value={localTitle}
							onChange={e => setLocalTitle(e.target.value)}
							onBlur={() => {
								if (localTitle !== task.title && localTitle.trim()) {
									handleUpdate({ title: localTitle })
								}
							}}
							className='text-[22px] font-semibold text-white bg-transparent border-0 outline-none w-full p-0 focus:ring-0'
							placeholder='Название задачи...'
						/>
					</div>
					<button
						onClick={() => closeModal('taskDetail')}
						className='p-1 hover:bg-white/10 rounded-full transition-colors'
					>
						<X className='w-7 h-7 text-white' strokeWidth={2.5} />
					</button>
				</header>

				<div className='grid grid-cols-12 gap-12'>
					{/* LEFT COLUMN */}
					<div className='col-span-7 space-y-8'>
						{/* Description */}
						<div className='space-y-2.5'>
							<label className='text-[14px] text-white/90 font-medium'>
								Описание
							</label>
							<textarea
								value={localDesc}
								onChange={e => setLocalDesc(e.target.value)}
								onBlur={() => {
									if (localDesc !== (task.description || '')) {
										handleUpdate({ description: localDesc })
									}
								}}
								className='w-full bg-transparent border border-white/20 rounded-[8px] p-3 min-h-[120px] focus:border-white/50 outline-none resize-none text-[14px] text-white placeholder:text-white/40'
								placeholder='Добавьте описание...'
							/>
						</div>

						{/* Comments */}
						<div className='space-y-2.5'>
							<label className='text-[14px] text-white/90 font-medium'>
								Комментарии
							</label>

							{task.comments && task.comments.length > 0 && (
								<div className='space-y-3 mb-4 max-h-[200px] overflow-y-auto'>
									{task.comments.map((comment: any) => (
										<div
											key={comment.id}
											className='p-3 rounded-[8px] bg-white/5 border border-white/10'
										>
											<div className='flex items-start justify-between mb-1'>
												<span className='text-[12px] font-semibold text-white'>
													{comment.user?.username || 'Пользователь'}
												</span>
												<span className='text-[11px] text-white/50'>
													{formatDate(
														parseSafeDate(comment.createdAt),
														'd MMM, HH:mm'
													)}
												</span>
											</div>
											<p className='text-[13px] text-white/80 leading-relaxed'>
												{comment.content}
											</p>
										</div>
									))}
								</div>
							)}

							<textarea
								value={newComment}
								onChange={e => setNewComment(e.target.value)}
								className='w-full bg-transparent border border-white/20 rounded-[8px] p-3 min-h-[90px] outline-none text-white placeholder:text-white/40 focus:border-white/50'
								placeholder='Написать комментарий...'
							/>
							<button
								onClick={() => {
									if (newComment.trim()) {
										console.log('Add comment:', newComment)
										setNewComment('')
									}
								}}
								className='bg-white text-black px-6 py-2 rounded-[8px] font-medium text-[14px] hover:bg-white/90 transition-colors'
							>
								Отправить
							</button>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className='col-span-5 space-y-5'>
						{/* Status - ИСПРАВЛЕН SelectValue */}
						<div className='space-y-2'>
							<label className='text-[14px] text-white/80'>Статус</label>
							<Select
								value={task.columnId}
								onValueChange={v => handleUpdate({ columnId: v })}
							>
								<SelectTrigger className='w-full bg-transparent border border-white/20 h-10 rounded-[8px] px-3 text-[14px] text-white [&>span]:text-white'>
									<SelectValue placeholder='Выберите статус' />
								</SelectTrigger>
								<SelectContent className='bg-[#1A1D21] border-white/10'>
									{boardData?.board?.columns.map((col: any) => (
										<SelectItem
											key={col.id}
											value={col.id}
											className='text-white focus:bg-white/10 focus:text-white'
										>
											{col.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<label className='text-[14px] text-white/80'>Приоритет</label>
							<Select
								value={task.priority || 'MEDIUM'}
								onValueChange={v => handleUpdate({ priority: v })}
							>
								<SelectTrigger className='w-full bg-transparent border border-white/20 h-10 rounded-[8px] px-3 text-[14px] text-white'>
									<SelectValue placeholder='Выберите приоритет' />
								</SelectTrigger>
								<SelectContent className='bg-[#1A1D21] border-white/10'>
									<SelectItem
										value='LOW'
										className='text-white focus:bg-white/10'
									>
										Низкий
									</SelectItem>
									<SelectItem
										value='MEDIUM'
										className='text-white focus:bg-white/10'
									>
										Средний
									</SelectItem>
									<SelectItem
										value='HIGH'
										className='text-white focus:bg-white/10'
									>
										Высокий
									</SelectItem>
									<SelectItem
										value='URGENT'
										className='text-white focus:bg-white/10'
									>
										Срочный
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Due Date */}
						<div className='space-y-2'>
							<label className='text-[14px] text-white/80'>Срок</label>
							<input
								type='date'
								value={getSafeDateValue(task.limitDate)}
								onChange={e => {
									if (e.target.value) {
										handleUpdate({ limitDate: e.target.value })
									}
								}}
								className='w-full bg-transparent border border-white/20 h-10 rounded-[8px] px-3 text-[14px] text-white outline-none focus:border-white/50 [color-scheme:dark]'
							/>
						</div>

						{/* Метки - Здесь span оправдан, т.к. это мультивыбор */}
						<div className='space-y-2'>
							<label className='text-[14px] text-white/80'>Метки</label>
							<Select onValueChange={toggleTag}>
								<SelectTrigger className='w-full bg-transparent border border-white/20 h-10 rounded-[8px] px-3 text-[14px] text-white'>
									<span>
										{task.tags?.length > 0
											? `${task.tags.length} выбрана`
											: 'Выбрать метку...'}
									</span>
								</SelectTrigger>
								<SelectContent className='bg-[#1A1D21] border-white/10'>
									{ALL_TAGS.map(tag => (
										<SelectItem
											key={tag}
											value={tag}
											className='text-white focus:bg-white/10'
										>
											{tag} {task.tags?.includes(tag) && '✓'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{task.tags?.length > 0 && (
								<div className='flex flex-wrap gap-2 pt-1'>
									{task.tags.map((tag: string) => (
										<span
											key={tag}
											className='bg-white text-black px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold cursor-pointer hover:bg-white/90 transition-colors'
											onClick={() => toggleTag(tag)}
										>
											{tag} ×
										</span>
									))}
								</div>
							)}
						</div>

						{/* Исполнители - ИСПРАВЛЕНЫ value и SelectValue */}
						<div className='space-y-2'>
							<label className='text-[14px] text-white/80'>Исполнители</label>
							<Select
								value={task.assigneeId || 'none'}
								onValueChange={v =>
									handleUpdate({ assigneeId: v === 'none' ? null : v })
								}
							>
								<SelectTrigger className='w-full bg-transparent border border-white/20 h-10 rounded-[8px] px-3 text-[14px] text-white [&>span]:text-white'>
									<SelectValue placeholder='Назначить...' />
								</SelectTrigger>
								<SelectContent className='bg-[#1A1D21] border-white/10'>
									<SelectItem
										value='none'
										className='text-white focus:bg-white/10'
									>
										Не назначен
									</SelectItem>

									{boardData?.board?.owner && (
										<SelectItem
											key={boardData.board.owner.id}
											value={boardData.board.owner.id}
											className='text-white focus:bg-white/10'
										>
											{boardData.board.owner.username} (владелец)
										</SelectItem>
									)}

									{boardData?.board?.members
										?.filter(
											(m: any) => m.user.id !== boardData.board.owner?.id
										)
										.map((m: any) => (
											<SelectItem
												key={m.user.id}
												value={m.user.id}
												className='text-white focus:bg-white/10'
											>
												{m.user.username}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className='pt-4 space-y-6'>
							<div className='flex items-start gap-2 text-white/50'>
								<Clock className='w-4 h-4 mt-0.5' />
								<div className='text-[13px] leading-tight'>
									<p>Создано</p>
									<p className='text-white/70'>
										{task.createdAt
											? formatDate(
													parseSafeDate(task.createdAt),
													'd MMMM yyyy, HH:mm'
												)
											: '—'}
									</p>
								</div>
							</div>

							<button
								onClick={handleDelete}
								className='w-full bg-white text-black py-2.5 rounded-[8px] flex items-center justify-center gap-2 font-medium text-[15px] hover:bg-white/90 transition-all'
							>
								<Trash2 className='w-5 h-5' /> Удалить
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
})
