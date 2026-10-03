import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories } from "@/lib/firestore";
import Image from "next/image";
import { Users, Heart, Target, Newspaper } from "lucide-react";

export const metadata = {
  title: "Nuestra Comunidad | El Diario de la Diáspora",
  description: "Conoce al equipo detrás de El Diario de la Diáspora y nuestro compromiso con la comunidad.",
};

const teamValues = [
  { icon: Users, title: "Unidad", desc: "Trabajamos juntos como una familia para traer la verdad a nuestra gente." },
  { icon: Heart, title: "Pasión", desc: "Cada historia se cuenta con el corazón y el respeto que merece la diáspora." },
  { icon: Target, title: "Compromiso", desc: "Nuestra meta diaria es informar con objetividad, rapidez y precisión." },
  { icon: Newspaper, title: "Vocación", desc: "El periodismo no es solo un trabajo para nosotros, es nuestro estilo de vida." },
];

export default async function ComunidadPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  const comm = settings.community;
  const bannerImage = comm?.bannerImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop";
  const title = comm?.title || "Nuestra Comunidad";
  const subtitle = comm?.subtitle || "Más que un medio de comunicación, somos una familia comprometida con llevarte la mejor información todos los días.";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header settings={settings} categories={categories} />

      <main className="flex-1 w-full mx-auto pb-10">
        {/* Banner Principal */}
        <section className="relative w-full h-[320px] md:h-[420px] lg:h-[520px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Imagen de fondo de la empresa unida */}
            <Image 
                src={bannerImage} 
                alt="Equipo de trabajo unido"
                fill
                className="object-cover opacity-40 mix-blend-overlay"
                priority
            />
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                <Image 
                    src="/logo-footer-white.png" 
                    alt="Logo El Diario de la Diáspora" 
                    width={480} 
                    height={130} 
                    priority
                    className="h-20 sm:h-28 md:h-36 max-h-[140px] w-auto object-contain mb-4 drop-shadow-2xl" 
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-headline tracking-tight mb-4 drop-shadow-lg">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-slate-200 font-medium drop-shadow-md max-w-2xl">
                    {subtitle}
                </p>
            </div>
        </section>

        {/* Valores */}
        <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamValues.map((val, idx) => {
                        const Icon = val.icon;
                        return (
                            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/60">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold font-headline mb-2">{val.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{val.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Galería Fotográfica de la Empresa */}
        <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold font-headline text-slate-900 dark:text-white mb-3">Galería Corporativa</h2>
                <p className="text-slate-600 dark:text-slate-400">Compartiendo el día a día y la unidad de nuestra empresa.</p>
            </div>

            {/* Grid de Imágenes (Foro / Galería) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Imagen 1 */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
                    <Image 
                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                        alt="Reunión editorial"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-bold font-headline text-lg">Reunión Editorial</span>
                    </div>
                </div>

                {/* Imagen 2 */}
                <div className="group relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
                    <Image 
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                        alt="Trabajo en equipo"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-bold font-headline text-lg">Nuestra Sala de Redacción</span>
                    </div>
                </div>

                {/* Imagen 3 */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2 lg:col-span-1">
                    <Image 
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                        alt="Celebrando un hito"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-bold font-headline text-lg">Celebrando Metas Juntos</span>
                    </div>
                </div>

                {/* Imagen 4 (Ancha) */}
                <div className="group relative aspect-video md:aspect-[21/9] lg:aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2 lg:col-span-2">
                    <Image 
                        src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"
                        alt="Unidad de la empresa"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-bold font-headline text-xl">El equipo completo de Diáspora</span>
                    </div>
                </div>

                {/* Imagen 5 */}
                <div className="group relative aspect-square md:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
                    <Image 
                        src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070&auto=format&fit=crop"
                        alt="Unidad y fraternidad"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white font-bold font-headline text-lg">Fraternidad</span>
                    </div>
                </div>

            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
