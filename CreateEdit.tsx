import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be less than 120 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const CreateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      toast.error('Please login to create or edit posts');
      navigate('/auth');
      return;
    }

    if (isEdit) {
      const fetchPost = async () => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data.user_id !== user.id) {
            toast.error('You can only edit your own posts');
            navigate('/');
            return;
          }

          setFormData({
            title: data.title,
            content: data.content,
            imageUrl: data.image_url || '',
          });
        } catch (error) {
          toast.error('Failed to load post');
          navigate('/');
        }
      };

      fetchPost();
    }
  }, [id, isEdit, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validation = postSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: formData.imageUrl.trim() || null,
        user_id: user!.id,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Post updated successfully!');
        navigate(`/post/${id}`);
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        toast.success('Post created successfully!');
        navigate(`/post/${data.id}`);
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} post`);
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-3xl py-8 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl">
              {isEdit ? 'Edit Post' : 'Create New Post'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-muted-foreground text-sm">(5-120 characters)</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your post title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={loading}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.title.length}/120 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">
                  Image URL <span className="text-muted-foreground text-sm">(optional)</span>
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  disabled={loading}
                  className={errors.imageUrl ? 'border-destructive' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-destructive">{errors.imageUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-muted-foreground text-sm">(minimum 50 characters)</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Share your story..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  disabled={loading}
                  rows={12}
                  className={errors.content ? 'border-destructive' : ''}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.content.length} characters
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEdit;
