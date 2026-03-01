import { memo } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import { useModal, useUIActions } from '../../store/ui.store'
import { useCreateBoard } from '../../hooks/useCreateBoard'

export const CreateBoardModal = memo(function CreateBoardModal() {
	const { isOpen } = useModal('boardCreate')
	const { closeModal } = useUIActions()

	const { title, setTitle, error, loading, createBoard, reset } =
		useCreateBoard(() => {
			closeModal('boardCreate')
		})

	const handleClose = () => {
		reset()
		closeModal('boardCreate')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		createBoard(title)
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[500px] p-10 bg-black text-white border-none rounded-[40px] shadow-2xl [&>button]:hidden'>
				<div className='flex justify-between items-center mb-8'>
					<h2 className='text-2xl font-black uppercase tracking-tight'>
						Создать доску
					</h2>
					<button
						onClick={handleClose}
						className='p-2 hover:bg-white/10 rounded-full transition-colors'
					>
						<X className='w-8 h-8 stroke-[3px]' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-8'>
					<div className='space-y-3'>
						<label className='text-white text-sm font-black uppercase tracking-widest'>
							Название доски *
						</label>
						<input
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder='Введите название...'
							disabled={loading}
							className='w-full bg-transparent border-2 border-white rounded-2xl px-6 py-4 outline-none focus:border-white transition-all font-bold text-lg placeholder:text-white/50'
							required
							autoFocus
						/>
					</div>

					{error && (
						<p className='text-sm text-red-500 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20'>
							{error}
						</p>
					)}

					<div className='flex gap-4 pt-4'>
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
							disabled={loading || !title.trim()}
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
