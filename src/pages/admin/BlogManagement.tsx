import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BlogManagement() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                // @ts-ignore
                .from('blogs')
                .select(`
          id, title, status, published_at, created_at,
          profiles!author_id ( full_name )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (error: any) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to load blog posts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            // @ts-ignore
            const { error } = await supabase.from('blogs').delete().eq('id', id);
            if (error) throw error;
            toast.success('Post deleted successfully');
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete post');
        }
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="w-full h-full pb-8">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Blog Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your clinic's blog content</p>
                    </div>
                    <Button asChild>
                        <Link to="/admin/blogs/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            All Posts
                        </CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search posts..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto text-muted mb-4" />
                                <p>No blog posts found</p>
                                {search ? (
                                    <Button variant="link" onClick={() => setSearch('')}>Clear search</Button>
                                ) : (
                                    <Button variant="outline" className="mt-4" asChild>
                                        <Link to="/admin/blogs/new">Create First Post</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">Title</th>
                                            <th className="pb-3 font-medium">Author</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBlogs.map((blog) => (
                                            <tr key={blog.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="py-4 font-medium">{blog.title}</td>
                                                <td className="py-4">{blog.profiles?.full_name || 'Unknown'}</td>
                                                <td className="py-4">
                                                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                                        {blog.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-muted-foreground">
                                                    {format(new Date(blog.created_at), 'MMM d, yyyy')}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/admin/blogs/${blog.id}`}>
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(blog.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
