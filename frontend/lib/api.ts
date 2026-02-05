import axios from 'axios';
import type { Board, List, Card, Label, Member, ChecklistItem } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Board API
export const boardApi = {
    getAll: () => api.get<Board[]>('/api/boards'),
    getById: (id: number) => api.get<Board>(`/api/boards/${id}`),
    create: (data: { title: string; backgroundColor?: string }) =>
        api.post<Board>('/api/boards', data),
    update: (id: number, data: { title?: string; backgroundColor?: string }) =>
        api.put<Board>(`/api/boards/${id}`, data),
    delete: (id: number) => api.delete(`/api/boards/${id}`),
};

// List API
export const listApi = {
    create: (data: { boardId: number; title: string; position?: number }) =>
        api.post<List>('/api/lists', data),
    update: (id: number, data: { title: string }) =>
        api.put<List>(`/api/lists/${id}`, data),
    updatePosition: (id: number, data: { position: number; boardId: number }) =>
        api.put<List>(`/api/lists/${id}/position`, data),
    delete: (id: number) => api.delete(`/api/lists/${id}`),
};

// Card API
export const cardApi = {
    create: (data: { listId: number; title: string; description?: string; position?: number }) =>
        api.post<Card>('/api/cards', data),
    getById: (id: number) => api.get<Card>(`/api/cards/${id}`),
    update: (id: number, data: { title?: string; description?: string; dueDate?: string | null; completed?: boolean }) =>
        api.put<Card>(`/api/cards/${id}`, data),
    move: (id: number, data: { listId: number; position: number }) =>
        api.put<Card>(`/api/cards/${id}/move`, data),
    archive: (id: number, archived: boolean) =>
        api.put<Card>(`/api/cards/${id}/archive`, { archived }),
    delete: (id: number) => api.delete(`/api/cards/${id}`),
    search: (query: string, boardId?: number) =>
        api.get<Card[]>('/api/cards/search/query', { params: { q: query, boardId } }),
    filter: (params: {
        boardId: number;
        labelIds?: string;
        memberIds?: string;
        dueDateFrom?: string;
        dueDateTo?: string;
    }) => api.get<Card[]>('/api/cards/filter/query', { params }),
};

// Label API
export const labelApi = {
    getAll: () => api.get<Label[]>('/api/labels'),
    addToCard: (cardId: number, labelId: number) =>
        api.post(`/api/labels/${cardId}/labels`, { labelId }),
    removeFromCard: (cardId: number, labelId: number) =>
        api.delete(`/api/labels/${cardId}/labels/${labelId}`),
};

// Member API
export const memberApi = {
    getAll: () => api.get<Member[]>('/api/members'),
    addToCard: (cardId: number, memberId: number) =>
        api.post(`/api/members/${cardId}/members`, { memberId }),
    removeFromCard: (cardId: number, memberId: number) =>
        api.delete(`/api/members/${cardId}/members/${memberId}`),
};

// Checklist API
export const checklistApi = {
    addItem: (cardId: number, data: { title: string; position?: number }) =>
        api.post<ChecklistItem>(`/api/checklist/${cardId}/items`, data),
    updateItem: (id: number, data: { title?: string; completed?: boolean }) =>
        api.put<ChecklistItem>(`/api/checklist/${id}`, data),
    deleteItem: (id: number) => api.delete(`/api/checklist/${id}`),
};

export default api;
