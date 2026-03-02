export function useDateFormatter() {
	const parseSafeDate = (dateVal: any) => {
		if (!dateVal) return null
		return /^\d+$/.test(String(dateVal)) ? Number(dateVal) : dateVal
	}

	const getSafeDateValue = (dateString: any) => {
		if (!dateString) return ''
		try {
			const parsed = parseSafeDate(dateString)
			if (!parsed) return ''
			const date = new Date(parsed)
			if (isNaN(date.getTime())) return ''

			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')

			return `${year}-${month}-${day}`
		} catch {
			return ''
		}
	}

	return { parseSafeDate, getSafeDateValue }
}
