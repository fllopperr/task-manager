import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/apollo'
import { useToken } from './store/auth.store'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { BoardsPage } from './pages/BoardsPage'
import { BoardPage } from './pages/BoardPage'
import { SettingsPage } from './components/settings/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const token = useToken()

	if (!token) {
		return <Navigate to='/login' replace />
	}

	return <>{children}</>
}

export function App() {
	return (
		<ApolloProvider client={apolloClient}>
			<BrowserRouter>
				<Routes>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
					<Route
						path='/'
						element={
							<ProtectedRoute>
								<BoardsPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/board/:boardId'
						element={
							<ProtectedRoute>
								<BoardPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/settings'
						element={
							<ProtectedRoute>
								<SettingsPage />
							</ProtectedRoute>
						}
					/>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</BrowserRouter>
		</ApolloProvider>
	)
}

export default App
