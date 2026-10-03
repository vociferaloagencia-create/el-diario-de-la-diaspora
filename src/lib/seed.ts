import { db } from './firebase';
import { collection, doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import seedData from './seed-data.json';

type SeedData = typeof seedData;

async function seedCollection<T extends { _id: string }>(
  collectionName: string,
  data: T[],
) {
  if (!data || data.length === 0) {
    console.log(`No data for ${collectionName}, skipping.`);
    return;
  }
  
  const collectionRef = collection(db, collectionName);
  console.log(`Seeding ${collectionName}...`);

  const batch = writeBatch(db);

  for (const item of data) {
    const docId = item._id;
    const docRef = doc(collectionRef, docId);

    // Convert date strings to Timestamps
    const sanitizedItem: { [key: string]: any } = { ...item };
    delete (sanitizedItem as any)._id; // Don't save the _id field in the document data

    for (const key in sanitizedItem) {
        if (key === 'publishedAt' || key === 'updatedAt' || key === 'createdAt') {
            if(typeof sanitizedItem[key] === 'string') {
                sanitizedItem[key] = Timestamp.fromDate(new Date(sanitizedItem[key]));
            }
        }
    }
    
    // Handle comments subcollection for articles
    if (collectionName === 'articles' && 'comments' in sanitizedItem && Array.isArray(sanitizedItem.comments)) {
        const comments = sanitizedItem.comments;
        delete sanitizedItem.comments;

        for (const comment of comments) {
            const commentId = comment._id;
            const commentRef = doc(collection(db, 'articles', docId, 'comments'), commentId);
            const sanitizedComment = { ...comment };
            delete (sanitizedComment as any)._id;

            if (typeof sanitizedComment.createdAt === 'string') {
              sanitizedComment.createdAt = Timestamp.fromDate(new Date(sanitizedComment.createdAt));
            }
            batch.set(commentRef, sanitizedComment);
        }
    }

    batch.set(docRef, sanitizedItem);
  }
  
  await batch.commit();
  console.log(`✅ ${collectionName} seeded successfully! (${data.length} documents)`);
}


async function main() {
  console.log('Starting database seed process...');

  try {
    // We need to cast the types because the JSON module is not strictly typed
    await seedCollection('settings', seedData.settings as any);
    await seedCollection('navigation', seedData.navigation as any);
    await seedCollection('categories', seedData.categories as any);
    await seedCollection('authors', seedData.authors as any);
    await seedCollection('articles', seedData.articles as any);
    await seedCollection('homepage', seedData.homepage as any);
    await seedCollection('ad_slots', (seedData as any).ad_slots as any);
    await seedCollection('weather_config', (seedData as any).weather_config as any);
    await seedCollection('article_page_config', (seedData as any).article_page_config as any);

    console.log('\nDatabase seeding completed successfully! ✨');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

main();
