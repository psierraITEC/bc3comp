import { writable } from 'svelte/store';

export const obraContent = writable(null);
export const bancoContent = writable(null);
export const comparacionResultados = writable([]);
export const progreso = writable(0);