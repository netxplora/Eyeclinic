import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/admin/TiptapEditor';

export default function BlogEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isNew = id === 'new';

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isNew && id) {
            fetchPost(id);
        }
    }, [id, isNew]);

    const fetchPost = async (postId: string) => {
        try {
            // @ts-ignore - dynamic table
            const { data, error } = await (supabase as any)
                .from('blogs')
                .select('*')
                .eq('id', postId)
                .single();

            if (error) throw error;

            if (data) {
                setTitle(data.title || '');
                setSlug(data.slug || '');
                setExcerpt(data.excerpt || '');
                setContent(data.content || '');
                setCoverImage(data.cover_image || '');
                setStatus(data.status as 'draft' | 'published');
            }
        } catch (error: any) {
            toast.error('Failed to load post details');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (isNew) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate MIME type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
            return;
        }

        // Validate file extension
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
            toast.error('Invalid file extension.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image is too large (max 5MB)');
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            // @ts-ignore - dynamic bucket
            const { error: uploadError } = await (supabase as any).storage
                .from('blog-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // @ts-ignore - dynamic bucket
            const { data: publicUrlData } = (supabase as any).storage
                .from('blog-media')
                .getPublicUrl(filePath);

            setCoverImage(publicUrlData.publicUrl);
            toast.success('Cover image uploaded successfully');
        } catch (error: any) {
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (submitStatus: 'draft' | 'published') => {
        if (!title || title.trim().length === 0) return toast.error('Title is required');
        if (title.length > 200) return toast.error('Title must be less than 200 characters');
        if (!slug || slug.trim().length === 0) return toast.error('Slug is required');
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return toast.error('Slug must contain only lowercase letters, numbers, and hyphens');
        if (!content || content.trim().length === 0) return toast.error('Content is required');
        if (!user) return toast.error('You must be logged in to save');
        if (excerpt && excerpt.length > 500) return toast.error('Excerpt must be less than 500 characters');

        setIsSaving(true);
        try {
            const postData = {
                title,
                slug,
                excerpt,
                content,
                cover_image: coverImage,
                status: submitStatus,
                author_id: user.id,
                updated_at: new Date().toISOString(),
                ...(submitStatus === 'published' && status !== 'published' ? { published_at: new Date().toISOString() } : {})
            };

            if (isNew) {
                // @ts-ignore - dynamic table
                const { error } = await (supabase as any).from('blogs').insert([postData]);
                if (error) throw error;
                toast.success(`Post ${submitStatus === 'published' ? 'published' : 'saved as draft'} successfully`);
                navigate('/admin/blogs');
            } else {
                // @ts-ignore - dynamic table
                const { error } = await (supabase as any).from('blogs').update(postData).eq('id', id);
                if (error) throw error;
                toast.success('Post updated successfully');
                setStatus(submitStatus);
            }
        } catch (error: any) {
            toast.error('Failed to save post. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full h-full pb-12">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 -mt-4 border-b border-slate-200/60 md:static md:bg-transparent md:backdrop-blur-none md:py-0 md:mt-0 md:border-none">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                        <Link to="/admin/blogs">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary truncate max-w-[200px] sm:max-w-md">
                            {title || 'Untitled Post'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status === 'published' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                                {status}
                            </Badge>
                            <span className="text-xs text-muted-foreground h-2 w-2 rounded-full bg-slate-300" />
                            <span className="text-xs text-muted-foreground">Draft saved locally</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="flex-1 md:flex-none hover:bg-slate-200/50"
                    >
                        Save Draft
                    </Button>
                    <Button
                        onClick={() => handleSave('published')}
                        disabled={isSaving}
                        className="flex-1 md:flex-none shadow-lg hover:shadow-xl transition-all"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {status === 'published' ? 'Update Post' : 'Publish Now'}
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <Input
                                placeholder="Post Title"
                                className="text-3xl font-bold h-16 px-4 bg-background shadow-sm"
                                value={title}
                                onChange={handleTitleChange}
                            />
                            <TiptapEditor content={content} onChange={setContent} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">URL Slug</label>
                                    <Input
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                        placeholder="post-url-slug"
                                    />
                                    <p className="text-xs text-muted-foreground">The URL friendly name. E.g., /blog/post-url-slug</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Excerpt</label>
                                    <Textarea
                                        value={excerpt}
                                        onChange={e => setExcerpt(e.target.value)}
                                        placeholder="A short summary for the blog card..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Cover Image</label>
                                    {coverImage && (
                                        <div className="relative rounded-lg overflow-hidden border aspect-video mb-2">
                                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        {coverImage ? 'Change Image' : 'Upload Cover'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
