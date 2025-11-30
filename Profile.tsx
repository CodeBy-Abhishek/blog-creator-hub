import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile');
      navigate('/auth');
      return;
    }

    const fetchUserPosts = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setUsername(profileData.username);

        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles(username)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        toast.error('Failed to load your posts');
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 animate-fade-in">
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Posts</h1>
              <p className="text-muted-foreground">@{username}</p>
            </div>
            <Button onClick={() => navigate('/create')} className="gap-2">
              <PenLine className="h-4 w-4" />
              Write New Post
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <h3 className="text-2xl font-bold">No posts yet</h3>
            <p className="text-muted-foreground">Start sharing your stories with the world!</p>
            <Button onClick={() => navigate('/create')} className="gap-2">
              <PenLine className="h-4 w-4" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                imageUrl={post.image_url}
                username={post.profiles.username}
                createdAt={post.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
