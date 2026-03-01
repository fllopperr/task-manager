import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useLogin } from '../../hooks/useLogin'

export function LoginForm() {
	const { formData, loading, error, handleChange, handleSubmit } = useLogin()

	return (
		<div className='text-black w-full max-w-md space-y-8 p-4'>
			<div className='text-center'>
				<h2 className='text-3xl font-bold tracking-tight'>С возвращением</h2>
				<p className='mt-2 text-sm text-muted-foreground'>
					Войдите в систему для управления задачами
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-5'>
				<div className='space-y-2'>
					<Label htmlFor='email'>Электронная почта</Label>
					<Input
						id='email'
						type='email'
						placeholder='name@company.com'
						value={formData.email}
						onChange={handleChange}
						required
						disabled={loading}
						autoComplete='email'
					/>
				</div>

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
						autoComplete='current-password'
					/>
				</div>

				{error && (
					<div className='p-3 text-xs font-medium bg-destructive/10 text-destructive rounded-md text-center border border-destructive/20 animate-in fade-in zoom-in duration-200'>
						{error}
					</div>
				)}

				<Button
					type='submit'
					className='w-full bg-black hover:bg-black/90 text-white active:scale-95 transition-transform'
					disabled={loading}
				>
					{loading ? 'Входим...' : 'Войти'}
				</Button>

				<div className='text-center text-sm'>
					<span className='text-muted-foreground'>Нет аккаунта? </span>
					<Link
						to='/register'
						className='text-foreground font-semibold underline underline-offset-4 hover:text-black transition-colors'
					>
						Зарегистрироваться
					</Link>
				</div>
			</form>
		</div>
	)
}
