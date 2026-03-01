import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useRegister } from '../../hooks/useRegister'

export function RegisterForm() {
	const { formData, loading, error, handleChange, handleSubmit } = useRegister()

	return (
		<div className='text-black w-full max-w-md space-y-8 p-4'>
			<div className='text-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Создать аккаунт</h2>
				<p className='text-muted-foreground mt-2 text-sm'>
					Начните организовывать свои проекты сегодня
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='username'>Полное имя</Label>
					<Input
						id='username'
						placeholder='Александр Иванов'
						value={formData.username}
						onChange={handleChange}
						required
						disabled={loading}
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='email'>Электронная почта</Label>
					<Input
						id='email'
						type='email'
						placeholder='alex@example.com'
						value={formData.email}
						onChange={handleChange}
						required
						disabled={loading}
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='password'>Пароль</Label>
						<Input
							id='password'
							type='password'
							placeholder='••••••••'
							value={formData.password}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>Повтор</Label>
						<Input
							id='confirmPassword'
							type='password'
							placeholder='••••••••'
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							disabled={loading}
						/>
					</div>
				</div>

				{error && (
					<div className='p-3 text-xs font-medium bg-destructive/10 text-destructive rounded-md text-center border border-destructive/20'>
						{error}
					</div>
				)}

				<Button
					type='submit'
					className='w-full bg-black text-white hover:bg-black active:scale-95'
					disabled={loading}
				>
					{loading ? 'Создание...' : 'Зарегистрироваться'}
				</Button>

				<div className='text-center text-sm'>
					<span className='text-muted-foreground'>Уже зарегистрированы? </span>
					<Link
						to='/login'
						className='text-muted-foreground font-semibold underline underline-offset-4 hover:text-black'
					>
						Войти
					</Link>
				</div>
			</form>
		</div>
	)
}
