export interface Background {
    id: string;
    type: 'photo' | 'color' | 'gradient';
    value: string;
    thumbnail?: string;
    category?: 'featured' | 'nature' | 'abstract';
}

export const BACKGROUND_PHOTOS: Background[] = [
    {
        id: 'photo-1',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100',
        category: 'nature'
    },
    {
        id: 'photo-2',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=100',
        category: 'nature'
    },
    {
        id: 'photo-3',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100',
        category: 'nature'
    },
    {
        id: 'photo-4',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100',
        category: 'nature'
    },
    {
        id: 'photo-5',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=100',
        category: 'nature'
    },
    {
        id: 'photo-6',
        type: 'photo',
        value: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=100',
        category: 'abstract'
    },
];

export const BACKGROUND_COLORS: Background[] = [
    {
        id: 'color-blue-1',
        type: 'color',
        value: '#0c66e4',
    },
    {
        id: 'color-blue-2',
        type: 'color',
        value: '#1f7ee7',
    },
    {
        id: 'gradient-purple',
        type: 'gradient',
        value: 'linear-gradient(135deg, #6e5dc6 0%, #cd519d 100%)',
    },
    {
        id: 'gradient-pink',
        type: 'gradient',
        value: 'linear-gradient(135deg, #e774bb 0%, #da62ac 100%)',
    },
    {
        id: 'color-dark-blue',
        type: 'color',
        value: '#172b4d',
    },
    {
        id: 'color-cyan',
        type: 'color',
        value: '#00c2e0',
    },
    {
        id: 'gradient-blue',
        type: 'gradient',
        value: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)',
    },
    {
        id: 'gradient-orange',
        type: 'gradient',
        value: 'linear-gradient(135deg, #ff9f1a 0%, #ff6900 100%)',
    },
    {
        id: 'color-green',
        type: 'color',
        value: '#61bd4f',
    },
];

export const DEFAULT_BACKGROUNDS: Background[] = [
    ...BACKGROUND_PHOTOS.slice(0, 4),
    ...BACKGROUND_COLORS.slice(0, 4),
];

export type VisibilityOption = 'private' | 'workspace' | 'public';

export interface VisibilityConfig {
    value: VisibilityOption;
    label: string;
    icon: string;
    description: string;
}

export const VISIBILITY_OPTIONS: VisibilityConfig[] = [
    {
        value: 'private',
        label: 'Private',
        icon: '🔒',
        description: 'Board members and Trello Workspace Workspace admins can see and edit this board.',
    },
    {
        value: 'workspace',
        label: 'Workspace',
        icon: '👥',
        description: 'All members of the Trello Workspace Workspace can see and edit this board.',
    },
    {
        value: 'public',
        label: 'Public',
        icon: '🌍',
        description: 'Anyone on the internet can see this board. Only board members can edit.',
    },
];
