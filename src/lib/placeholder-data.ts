import type { Article } from './types';
import { PlaceHolderImages } from './placeholder-images';

const politicsImage1 = PlaceHolderImages.find(img => img.id === 'politics-1');
const sportsImage1 = PlaceHolderImages.find(img => img.id === 'sports-1');
const techImage1 = PlaceHolderImages.find(img => img.id === 'tech-1');
const politicsImage2 = PlaceHolderImages.find(img => img.id === 'politics-2');
const sportsImage2 = PlaceHolderImages.find(img => img.id === 'sports-2');
const techImage2 = PlaceHolderImages.find(img => img.id === 'tech-2');

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Global Leaders Summit Addresses Climate Change',
    content: 'World leaders gathered today to discuss new initiatives to combat the growing climate crisis. The summit aims to produce a new international treaty on carbon emissions...',
    category: 'Politics',
    imageUrl: politicsImage1?.imageUrl,
    imageHint: politicsImage1?.imageHint,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'The Rise of AI in Modern Software Development',
    content: 'Artificial intelligence is no longer a futuristic concept but a present-day tool revolutionizing the tech industry. From code generation to automated testing, AI is reshaping how developers work...',
    category: 'Technology',
    imageUrl: techImage1?.imageUrl,
    imageHint: techImage1?.imageHint,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Underdog Team Wins Championship in Stunning Upset',
    content: 'In an electrifying final, the Wildcats have clinched the national championship against all odds. Their victory came in the final seconds of the game with a remarkable play...',
    category: 'Sports',
    imageUrl: sportsImage1?.imageUrl,
    imageHint: sportsImage1?.imageHint,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'New Legislation Proposed to Overhaul Tax System',
    content: 'A new bill introduced in parliament aims to simplify the tax code for individuals and small businesses. Proponents argue it will spur economic growth, while critics raise concerns about its impact on social programs.',
    category: 'Politics',
    imageUrl: politicsImage2?.imageUrl,
    imageHint: politicsImage2?.imageHint,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Quantum Computing Reaches New Milestone',
    content: 'Researchers have announced a breakthrough in quantum computing, demonstrating a stable qubit that can operate for longer periods than ever before. This could accelerate the development of powerful new computers.',
    category: 'Technology',
    imageUrl: techImage2?.imageUrl,
    imageHint: techImage2?.imageHint,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
    {
    id: '6',
    title: 'Marathon World Record Shattered in Berlin',
    content: 'The world of athletics is buzzing after the Berlin Marathon, where a new world record was set. The runner finished with an astonishing time, beating the previous record by over a minute.',
    category: 'Sports',
    imageUrl: sportsImage2?.imageUrl,
    imageHint: sportsImage2?.imageHint,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
