import { memo, useMemo } from 'react'
import { Search, ChevronRight, Plus } from 'lucide-react'
import { useUIActions } from '../../store/ui.store'
import { useAuthStore } from '../../store/auth.store'
import { ALL_TAGS, ALL_PRIORITIES } from '../../constants/constants'
import type { Column, User } from '../../types'

interface Filters {
	tags: string[]
	assignees: string[]
	priorities: string[]
}

interface HeaderProps {
	boardTitle?: string
	taskCount?: number
	inProgressCount?: number
	doneCount?: number
	overdueCount?: number
	search: string
	onSearchChange: (value: string) => void
	filtersOpen: boolean
	onToggleFilters: () => void
	filters: Filters
	onChangeFilters: (next: Filters) => void
	boardMembers?: Array<{ user: { id: string; username: string } }>
	boardOwner?: User
	columns?: Column[]
}

const FilterSection = memo(function FilterSection({
	title,
	items,
	selected,
	onChange
}: {
	title: string
	items: string[]
	selected: string[]
	onChange: (next: string[]) => void
}) {
	const toggle = (item: string) => {
		if (selected.includes(item)) {
			onChange(selected.filter(i => i !== item))
		} else {
			onChange([...selected, item])
		}
	}

	return (
		<div className='space-y-2'>
			<p className='font-semibold opacity-80'>{title}</p>

			<div className='space-y-1 text-sm'>
				{items.map(item => (
					<label
						key={item}
						className='flex items-center gap-2 cursor-pointer select-none'
					>
						<input
							type='checkbox'
							checked={selected.includes(item)}
							onChange={() => toggle(item)}
							className='accent-white'
						/>
						<span>{item}</span>
					</label>
				))}
			</div>
		</div>
	)
})

export const Header = memo(function Header({
	boardTitle = 'Разработка продукта',
	taskCount = 0,
	inProgressCount = 0,
	doneCount = 0,
	overdueCount = 0,
	search,
	onSearchChange,
	filtersOpen,
	onToggleFilters,
	filters,
	onChangeFilters,
	boardMembers = [],
	boardOwner,
	columns = []
}: HeaderProps) {
	const { openModal } = useUIActions()
	const user = useAuthStore(s => s.user)

	// ✅ Извлекаем usernames из members + owner
	const assigneeNames = useMemo(() => {
		const names = new Set<string>()

		if (boardOwner) {
			names.add(boardOwner.username)
		}

		boardMembers.forEach(m => {
			names.add(m.user.username)
		})

		return Array.from(names).sort()
	}, [boardMembers, boardOwner])

	return (
		<div className='w-full flex justify-between items-start mb-8'>
			<div className='flex flex-col gap-4 bg-[#F4F5F7] px-6 py-5 rounded-[20px] w-fit relative'>
				<div className='flex items-center gap-8'>
					<h2 className='text-[20px] font-semibold text-[#1A1D21] tracking-tight'>
						{boardTitle}
					</h2>

					<div className='flex items-center gap-5 text-[15px] font-medium text-[#1A1D21]'>
						<span>{taskCount} задачи</span>
						<span>{inProgressCount} в работе</span>
						<span>{doneCount} Завершено</span>
						<span>{overdueCount} Просрочено</span>
					</div>
				</div>

				<div className='flex items-center gap-3'>
					<div className='relative'>
						<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1D21]' />
						<input
							value={search}
							onChange={e => onSearchChange(e.target.value)}
							className='w-[300px] bg-transparent border border-[#1A1D21] rounded-[12px] py-2.5 pl-11 pr-4 outline-none placeholder:text-[#1A1D21]/70 text-[#1A1D21] font-medium text-[15px]'
							placeholder='поиск задачи...'
						/>
					</div>

					<button
						onClick={onToggleFilters}
						className='flex items-center gap-2 bg-[#0B0D10] text-white px-6 py-2.5 rounded-[12px] font-medium hover:bg-black transition-all active:scale-95 text-[15px]'
					>
						<span>Фильтр</span>
						<ChevronRight
							className={`w-4 h-4 transition-transform ${
								filtersOpen ? 'rotate-90' : ''
							}`}
						/>
					</button>

					{filtersOpen && (
						<div className='absolute top-32 left-[336px] w-[260px] bg-black text-white rounded-[24px] p-5 shadow-2xl z-50 space-y-5'>
							{/* ✅ Теги из GraphQL enum */}
							<FilterSection
								title='Метки'
								items={ALL_TAGS}
								selected={filters.tags}
								onChange={next => onChangeFilters({ ...filters, tags: next })}
							/>

							{/* ✅ Исполнители из БД */}
							{assigneeNames.length > 0 && (
								<FilterSection
									title='Исполнители'
									items={assigneeNames}
									selected={filters.assignees}
									onChange={next =>
										onChangeFilters({ ...filters, assignees: next })
									}
								/>
							)}

							{/* ✅ Приоритеты из GraphQL enum */}
							<FilterSection
								title='Приоритет'
								items={ALL_PRIORITIES}
								selected={filters.priorities}
								onChange={next =>
									onChangeFilters({ ...filters, priorities: next })
								}
							/>
						</div>
					)}

					<button
						onClick={() => openModal('taskCreate')}
						className='flex items-center gap-2 bg-transparent border border-[#1A1D21] text-[#1A1D21] px-5 py-2.5 rounded-[12px] font-medium hover:bg-black/5 transition-all active:scale-95 text-[15px]'
					>
						<Plus className='w-5 h-5' />
						<span>Новая задача</span>
					</button>
				</div>
			</div>

			<div className='flex items-center gap-3 mt-2 pr-2'>
				<div className='text-right'>
					<p className='text-[16px] font-semibold text-[#1A1D21] leading-tight'>
						{user?.username || 'Алексей'}
					</p>
					<p className='text-[13px] text-[#1A1D21]/60 mt-0.5 font-medium'>
						{user?.email || 'example@mail.com'}
					</p>
				</div>

				<div className='w-11 h-11 bg-[#0B0D10] rounded-full flex items-center justify-center relative overflow-hidden'>
					<div className='absolute top-2.5 w-4 h-4 bg-white rounded-full' />
					<div className='absolute bottom-[-2px] w-8 h-5 bg-white rounded-t-full' />
				</div>
			</div>
		</div>
	)
})
