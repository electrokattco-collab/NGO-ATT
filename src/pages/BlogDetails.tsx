import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Share2, Bookmark, Clock, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { firebaseService } from '@/src/services/firebaseService';
import { COLLECTIONS } from '@/src/constants';
import { BlogPost } from '@/src/types';
import { formatDate, calculateReadingTime } from '@/src/utils';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { query, where, limit } from 'firebase/firestore';

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const posts = await firebaseService.getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS, [
          where('slug', '==', slug),
          limit(1)
        ]);

        if (posts.length > 0) {
          const currentPost = posts[0];
          setPost(currentPost);
          
          // Fetch related posts from same category
          const related = await firebaseService.getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS, [
            where('category', '==', currentPost.category),
            where('status', '==', 'published'),
            limit(3)
          ]);
          setRelatedPosts(related.filter(p => p.id !== currentPost.id));
        } else {
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="pt-40 text-center animate-pulse py-40">SYSTEM INITIALIZING ARTICLE DATA...</div>;
  }

  if (!post) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="h-[60vh] relative overflow-hidden group">
         <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-dark/40" />
         <div className="absolute inset-0 flex items-center justify-center pt-20">
            <div className="container-custom text-center space-y-8">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
               >
                 <Badge variant="primary" className="bg-white/10 text-white backdrop-blur-md border-white/20 px-8 py-2">
                    {post.category}
                 </Badge>
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic font-serif leading-none max-w-5xl mx-auto"
               >
                 {post.title}
               </motion.h1>
            </div>
         </div>
      </div>

      <div className="container-custom py-24 lg:py-32 grid lg:grid-cols-4 gap-20">
         {/* Sidebar Controls */}
         <aside className="lg:col-span-1 space-y-12 h-fit lg:sticky lg:top-32 order-2 lg:order-1">
            <div className="space-y-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Attribution</p>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center font-black text-white text-lg">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-dark text-sm uppercase">{post.author}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Clinical Team</p>
                  </div>
               </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-100">
               <div className="flex items-center gap-4 text-slate-400">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(post.createdAt)}</span>
               </div>
               <div className="flex items-center gap-4 text-slate-400">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{calculateReadingTime(post.content)} Minute Analysis</span>
               </div>
            </div>

            <div className="pt-10 border-t border-slate-100 space-y-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Distribution</p>
               <div className="flex gap-4">
                  <button className="p-4 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition-all">
                     <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition-all">
                     <Bookmark className="w-5 h-5" />
                  </button>
               </div>
            </div>

            <Link to="/blog" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group pt-10">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
               Repository Base
            </Link>
         </aside>

         {/* Content Block */}
         <article className="lg:col-span-3 order-1 lg:order-2">
            <div className="markdown-body article-content">
               <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-40 pt-20 border-t border-slate-100 space-y-16">
                 <div className="space-y-4">
                    <Badge variant="info">Intelligence Matrix</Badge>
                    <h3 className="text-4xl font-black text-dark uppercase tracking-tight italic font-serif">Related Insights.</h3>
                 </div>
                 <div className="grid md:grid-cols-2 gap-10">
                    {relatedPosts.map(p => (
                       <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                          <Card className="p-0 overflow-hidden border-none bg-slate-50 group-hover:bg-white border hover:border-slate-100 transition-all">
                             <div className="aspect-[16/9] overflow-hidden">
                                <img src={p.featuredImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                             </div>
                             <div className="p-8 space-y-4">
                                <h4 className="font-black text-dark text-xl uppercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   Execute Discovery <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                             </div>
                          </Card>
                       </Link>
                    ))}
                 </div>
              </div>
            )}
         </article>
      </div>
    </div>
  );
}
