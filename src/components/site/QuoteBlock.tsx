interface QuoteBlockProps {
    text: string;
    author?: string;
}

export function QuoteBlock({ text, author }: QuoteBlockProps) {
    return (
        <blockquote className="my-8 border-l-4 border-primary pl-4 italic">
            <p className="text-xl font-medium">"{text}"</p>
            {author && <footer className="mt-2 text-base text-muted-foreground">- {author}</footer>}
        </blockquote>
    );
}
