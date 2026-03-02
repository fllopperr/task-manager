import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useRegister } from '../../hooks/useRegister'

export function RegisterForm() {
	const { formData, loading, errors, handleChange, handleSubmit } =
		useRegister()

	return (
		<div className='text-black w-full max-w-md space-y-8 p-4'>
			<div className='text-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Создать аккаунт</h2>
				<p className='text-muted-foreground mt-2 text-sm'>
					Начните организовывать свои проекты сегодня
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='space-y-1'>
					<Label htmlFor='username'>Полное имя</Label>
					<Input
						id='username'
						placeholder='Александр Иванов'
						value={formData.username}
						onChange={handleChange}
						disabled={loading}
						className={
							errors.username
								? 'border-destructive focus-visible:ring-destructive'
								: ''
						}
					/>
					{errors.username && (
						<p className='text-[11px] text-destructive font-semibold ml-1'>
							{errors.username}
						</p>
					)}
				</div>

				<div className='space-y-1'>
					<Label htmlFor='email'>Электронная почта</Label>
					<Input
						id='email'
						type='email'
						placeholder='alex@example.com'
						value={formData.email}
						onChange={handleChange}
						disabled={loading}
						className={
							errors.email
								? 'border-destructive focus-visible:ring-destructive'
								: ''
						}
					/>
					{errors.email && (
						<p className='text-[11px] text-destructive font-semibold ml-1'>
							{errors.email}
						</p>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-1'>
						<Label htmlFor='password'>Пароль</Label>
						<Input
							id='password'
							type='password'
							placeholder='••••••••'
							value={formData.password}
							onChange={handleChange}
							disabled={loading}
							className={
								errors.password
									? 'border-destructive focus-visible:ring-destructive'
									: ''
							}
						/>
						{errors.password && (
							<p className='text-[11px] text-destructive font-semibold ml-1'>
								{errors.password}
							</p>
						)}
					</div>
					<div className='space-y-1'>
						<Label htmlFor='confirmPassword'>Повтор</Label>
						<Input
							id='confirmPassword'
							type='password'
							placeholder='••••••••'
							value={formData.confirmPassword}
							onChange={handleChange}
							disabled={loading}
							className={
								errors.confirmPassword
									? 'border-destructive focus-visible:ring-destructive'
									: ''
							}
						/>
						{errors.confirmPassword && (
							<p className='text-[11px] text-destructive font-semibold ml-1'>
								{errors.confirmPassword}
							</p>
						)}
					</div>
				</div>

				{errors.common && (
					<div className='p-3 text-xs font-medium bg-destructive/10 text-destructive rounded-md text-center border border-destructive/20'>
						{errors.common}
					</div>
				)}

				<Button
					type='submit'
					className='w-full bg-black text-white hover:bg-black/90 active:scale-95 transition-all'
					disabled={loading}
				>
					{loading ? 'Создание...' : 'Зарегистрироваться'}
				</Button>

				<div className='text-center text-sm'>
					<span className='text-muted-foreground'>Уже зарегистрированы? </span>
					<Link
						to='/login'
						className='text-black font-semibold underline underline-offset-4 hover:text-muted-foreground'
					>
						Войти
					</Link>
				</div>
			</form>
		</div>
	)
}
