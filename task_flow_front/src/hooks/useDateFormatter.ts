export function useDateFormatter() {
	const parseSafeDate = (dateVal: any) => {
		if (!dateVal) return dateVal
		return /^\d+$/.test(String(dateVal)) ? Number(dateVal) : dateVal
	}

	const getSafeDateValue = (dateString: any) => {
		if (!dateString) return ''

		try {
			const date = new Date(parseSafeDate(dateString))
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
