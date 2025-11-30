import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
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

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 9;

  const fetchPosts = async (currentPage: number, search: string = '') => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*, profiles(username)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,profiles.username.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setPosts(data || []);
      setHasMore(count ? count > currentPage * POSTS_PER_PAGE : false);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, searchQuery);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-subtle border-b">
        <div className="container py-16 space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Welcome to Blogora
            </h1>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Stories Worth Reading</h3>
            <p className="text-xl text-muted-foreground">
              Discover thought-provoking articles and share your own perspectives
            </p>
          </div>
          
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-2 animate-slide-up"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <h3 className="text-2xl font-bold">No posts found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Be the first to write a post!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
