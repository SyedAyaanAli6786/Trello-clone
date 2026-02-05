export interface Board {
    id: number;
    title: string;
    backgroundColor: string;
    createdAt: string;
    updatedAt: string;
    lists?: List[];
}

export interface List {
    id: number;
    boardId: number;
    title: string;
    position: number;
    createdAt: string;
    updatedAt: string;
    cards?: Card[];
}

export interface Card {
    id: number;
    listId: number;
    title: string;
    description: string | null;
    position: number;
    dueDate: string | null;
    completed: boolean;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
    cardLabels?: CardLabel[];
    cardMembers?: CardMember[];
    checklistItems?: ChecklistItem[];
    list?: List;
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface CardLabel {
    id: number;
    cardId: number;
    labelId: number;
    label: Label;
}

export interface Member {
    id: number;
    name: string;
    avatarUrl: string | null;
    email: string;
}

export interface CardMember {
    id: number;
    cardId: number;
    memberId: number;
    member: Member;
}

export interface ChecklistItem {
    id: number;
    cardId: number;
    title: string;
    completed: boolean;
    position: number;
    createdAt: string;
}
