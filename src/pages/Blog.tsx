import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import FloatingCTA from '@/components/FloatingCTA';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, ArrowRight, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import clinicExterior from '@/assets/satome/hero-eyecare.png';

export default function Blog() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPublishedBlogs();
    }, []);

    const fetchPublishedBlogs = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('blogs')
                .select(`
          id, title, slug, excerpt, cover_image, published_at,
          profiles!author_id ( full_name )
        `)
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <FloatingCTA />

            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src={clinicExterior}
                        alt="Satome Eye Clinic Blog"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
                    <Badge className="mb-6 bg-primary/20 text-white border-primary/50 backdrop-blur-sm animate-fade-in-up">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Our Blog
                    </Badge>
                    <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md animate-fade-in-up animation-delay-100">
                        Eye Care <span className="text-primary">Insights</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-fade-in-up animation-delay-200">
                        Stay updated with the latest news, eye care tips, and expert advice from the specialists at Satome Eye Clinic.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-24 bg-background min-h-[50vh]">
                <div className="container mx-auto px-4 lg:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="w-16 h-16 mx-auto text-muted mb-6" />
                            <h2 className="text-2xl font-bold mb-2">No Articles Yet</h2>
                            <p className="text-muted-foreground">Check back soon for insights and updates from our team.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <Card key={blog.id} className="overflow-hidden group hover:shadow-xl transition-all border-border/50 border-2">
                                    <Link to={`/blog/${blog.slug}`}>
                                        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                                            {blog.cover_image ? (
                                                <img
                                                    src={blog.cover_image}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                    <BookOpen className="w-12 h-12 text-primary/20" />
                                                </div>
                                            )}
                                            {blog.published_at && (
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90 border-0 shadow-sm">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {format(new Date(blog.published_at), 'MMM d, yyyy')}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <CardContent className="p-6">
                                        <div className="flex items-center text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                                            <User className="w-3 h-3 mr-1" />
                                            {blog.profiles?.full_name || 'Satome Specialist'}
                                        </div>
                                        <Link to={`/blog/${blog.slug}`}>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                {blog.title}
                                            </h3>
                                        </Link>
                                        <p className="text-muted-foreground mb-6 line-clamp-3 text-sm leading-relaxed">
                                            {blog.excerpt || blog.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
                                        </p>
                                        <Button variant="ghost" asChild className="p-0 hover:bg-transparent hover:text-primary text-primary/80 group-hover:text-primary font-semibold">
                                            <Link to={`/blog/${blog.slug}`}>
                                                Read Article <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}
