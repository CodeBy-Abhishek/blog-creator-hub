import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  username: string;
  createdAt: string;
}

const PostCard = ({ id, title, content, imageUrl, username, createdAt }: PostCardProps) => {
  const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Link to={`/post/${id}`}>
      <Card className="group hover:shadow-card transition-all duration-300 cursor-pointer h-full overflow-hidden">
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <CardHeader className="space-y-2">
          <h2 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
        </CardContent>
        <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium">{username}</span>
          <span>•</span>
          <time>{timeAgo}</time>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PostCard;
