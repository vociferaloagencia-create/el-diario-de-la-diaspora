import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getAllArticles();
    const data = articles.map(a => ({
      id: a._id,
      title: a.title,
      slug: a.slug,
      slugLength: a.slug.length,
      encodedSlug: encodeURIComponent(a.slug)
    }));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
