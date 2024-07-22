export function saveToAutosave(data: string) {
	localStorage.setItem('autosave', data);
}

export function getAutosave() {
	return localStorage.getItem('autosave');
}
