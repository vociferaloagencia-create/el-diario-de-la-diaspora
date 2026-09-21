import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Comment {
    author: string;
    avatarUrl?: string;
    date: string;
    text: string;
}

interface CommentsSectionProps {
    comments: Comment[];
}

function CommentForm() {
    return (
         <form className="space-y-4">
            <Textarea placeholder="Write a comment..." />
            <Button>Post Comment</Button>
        </form>
    )
}

function CommentList({ comments }: { comments: Comment[] }) {
    return (
        <div className="space-y-6">
            {comments.map((comment, index) => (
                <div key={index} className="flex gap-4">
                    <Avatar>
                        <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                        <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <p className="font-semibold">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.date}</p>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function CommentsSection({ comments }: CommentsSectionProps) {
    return (
        <Card className="mt-12">
            <CardHeader>
                <CardTitle>{comments.length} Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
               <CommentForm />
               <CommentList comments={comments} />
            </CardContent>
        </Card>
    );
}
