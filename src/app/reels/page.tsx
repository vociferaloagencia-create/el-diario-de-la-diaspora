import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getAllReels, getSiteSettings, getCategories } from "@/lib/firestore";
import Link from "next/link";
import { Video } from "lucide-react";

export default async function ReelsPage() {
    const reels = await getAllReels();
    const settings = await getSiteSettings();
    const categories = await getCategories();

    return (
        <div className="flex flex-col min-h-screen">
            <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline">Reels</h1>
                    <p className="text-muted-foreground">Videos cortos de nuestro equipo.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {reels.map((reel) => (
                        <Link key={reel._id} href={reel.url} target="_blank" rel="noopener noreferrer" className="group space-y-2">
                            <div className="aspect-w-9 aspect-h-16 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                                <video src={reel.url} className="w-full h-full object-cover" muted loop playsInline />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2 text-white">
                                    <p className="font-bold text-sm line-clamp-2">{reel.title}</p>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3 transition-opacity opacity-0 group-hover:opacity-100">
                                    <Video className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {reels.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">Aún no se han publicado reels.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
