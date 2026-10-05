import type { Article, Reel, Author } from './types';

export const defaultAuthors: Author[] = [
  {
    _id: 'redaccion-diaspora',
    name: 'Redacción Diáspora',
    slug: 'redaccion-diaspora',
    bio: 'Equipo editorial especializado en noticias internacionales y comunidades hispanas.',
    avatarUrl: '/images/hero_summit.jpg',
    role: 'Editorial',
    socialLinks: {
      twitter: 'https://twitter.com',
      website: 'https://eldiariodeladiaspora.com',
    },
  },
];

export const defaultReels: Reel[] = [
  {
    _id: 'reel-1',
    title: 'Resumen de la Cumbre Internacional de la Diáspora en 60 segundos',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-09-03T12:00:00Z',
  },
  {
    _id: 'reel-2',
    title: 'Así funciona el nuevo pasaporte biométrico dominicano',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    _id: 'reel-3',
    title: 'Lo mejor del Festival de Culturas de la Diáspora',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-09-03T10:00:00Z',
  },
];

export const defaultArticles: Article[] = [];

