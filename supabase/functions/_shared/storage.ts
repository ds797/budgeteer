import { service } from './service.ts'

const blobTo64 = async (blob: Blob) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(blob)
		reader.onloadend = () => {
			const data = reader.result
			resolve(data)
		}
		reader.onerror = reject
	})
}

export const storage = {
	get: async (name: string) => {
		const { data } = await service.storage.from('institutions').download(name)

		if (data) return await blobTo64(data)

		return null
	},
	set: async (name: string, base64: string) => {
		const array = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

		const { data } = await service.storage.from('institutions').download(name)

		if (data) {
			const deblobbed: any = await blobTo64(data)

			if (deblobbed.split(',')[1] === base64) return
		}

		await service.storage.from('institutions').upload(name, array, {
			contentType: 'image/png'
		})
	}
}