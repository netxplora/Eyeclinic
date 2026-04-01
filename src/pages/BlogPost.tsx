import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import FloatingCTA from '@/components/FloatingCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, Loader2, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import heroSlideExam from '@/assets/satome/hero-slide-exam.png';
import DOMPurify from 'dompurify';

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchPost(slug);
        }
    }, [slug]);

    const fetchPost = async (postSlug: string) => {
        try {
            const { data, error } = await (supabase as any)
                .from('blogs')
                .select(`
          id, title, excerpt, content, cover_image, published_at,
          profiles!author_id ( full_name )
        `)
                .eq('slug', postSlug)
                .eq('status', 'published')
                .single();

            if (error) throw error;
            setPost(data);
        } catch (error: any) {
            console.error('Error fetching post:', error);
            toast.error('Article not found');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post?.title,
                    text: post?.excerpt || 'Check out this article from Satome Eye Clinic',
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
            }
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div className="min-h-screen py-32 flex flex-col items-center text-center px-4">
                    <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                    <p className="text-muted-foreground mb-8 text-lg max-w-lg">
                        The article you are looking for does not exist or has been removed.
                    </p>
                    <Button asChild size="lg">
                        <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    const bgImage = post.cover_image || heroSlideExam;

    return (
        <Layout>
            <FloatingCTA />

            {/* Dynamic Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src={bgImage}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <Badge className="bg-primary/20 hover:bg-primary/30 text-white border-primary/50 mb-6 backdrop-blur-sm animate-fade-in-up">
                            Eye Care Tips
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight drop-shadow-md animate-fade-in-up animation-delay-100">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-white/80 animate-fade-in-up animation-delay-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mr-3 border border-white/10 backdrop-blur-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="text-left leading-tight">
                                    <span className="block text-xs uppercase tracking-wider text-white/50">Written by</span>
                                    <span className="font-semibold text-white">{post.profiles?.full_name || 'Satome Specialist'}</span>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-white/20"></div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 border border-white/10 backdrop-blur-sm">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="text-left leading-tight">
                                    <span className="block text-xs uppercase tracking-wider text-white/50">Published</span>
                                    <span className="font-semibold text-white">
                                        {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recently'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-20 bg-background -mt-10 relative z-20">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="max-w-3xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border/50">

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pb-8 mb-8 border-b">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4" asChild>
                                <Link to="/blog">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> All Articles
                                </Link>
                            </Button>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-muted-foreground mr-2">Share:</span>
                                <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={handleShare}>
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Prose Content */}
                        <div className="prose prose-lg sm:prose-xl prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none prose-img:rounded-xl prose-img:shadow-md animate-fade-in-up">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                        </div>

                        {/* Author Footer */}
                        <div className="mt-16 bg-muted/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-border/50">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center shadow-inner">
                                <User className="w-10 h-10 text-primary" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold mb-2">{post.profiles?.full_name || 'Satome Specialist'}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Dedicated to providing expert eye care insights and helping the community maintain healthy, clear vision for life. Book a consultation today to benefit from personalized treatment.
                                </p>
                                <div className="mt-4 flex gap-4 justify-center sm:justify-start">
                                    <Button asChild size="sm">
                                        <Link to="/book">Consult Specialist</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
