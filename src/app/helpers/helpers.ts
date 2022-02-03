class converts {
	private async readAsBase64(photo) {
		const res = await fetch(photo.webPath!);
		const blob = await res.blob();

		return await this.convertBlobBase64(blob) as string
	}


	convertBlobBase64 = (blob: Blob) => new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onerror = rej;
		reader.onload = () => {
			res(reader.result);
		};

		reader.readAsDataURL(blob);
	});
}
