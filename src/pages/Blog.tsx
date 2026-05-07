import React from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/src/hooks/useCollection';
import { COLLECTIONS } from '@/src/constants';
import { BlogPost } from '@/src/types';
import { orderBy, where } from 'firebase/firestore';
import { formatDate, truncate, calculateReadingTime } from '@/src/utils';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function Blog() {
  const { data: posts, loading } = useCollection<BlogPost>(COLLECTIONS.BLOG_POSTS, {
    constraints: [
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    ]
  });

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="pt-20 bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="container-custom space-y-10 text-center">
           <Badge variant="primary">The Knowledge Hub</Badge>
           <h1 className="text-6xl md:text-8xl font-black text-dark tracking-tight uppercase leading-tight italic font-serif secondary-font">
             Mental <br/><span className="text-primary not-italic font-sans">Strategic Awareness.</span>
           </h1>
           <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
             Disseminating clinical insights and community success stories to scale mental wellness across South Africa.
           </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom space-y-32">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-96 bg-slate-50 rounded-[3rem] animate-pulse" />
               ))}
             </div>
          ) : posts.length === 0 ? (
             <div className="text-center py-40">
               <h3 className="text-2xl font-black text-dark uppercase tracking-tight">Intelligence Feed Exhausted</h3>
               <p className="text-slate-400 mt-4">New strategic updates are pending deployment.</p>
             </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <div className="group">
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row min-h-[500px]">
                      <div className="lg:w-1/2 overflow-hidden relative">
                         <img 
                           src={featuredPost.featuredImage} 
                           alt={featuredPost.title}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                         />
                         <div className="absolute inset-0 bg-dark/20 group-hover:bg-dark/10 transition-colors" />
                      </div>
                      <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center space-y-8 bg-slate-50 group-hover:bg-white transition-colors">
                         <div className="flex items-center gap-4 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                            <span className="bg-primary/10 px-3 py-1 rounded">FEATURED DEPLOYMENT</span>
                            <span>{calculateReadingTime(featuredPost.content)} MIN READ</span>
                         </div>
                         <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight leading-tight uppercase italic font-serif group-hover:not-italic transition-all group-hover:text-primary">
                           {featuredPost.title}
                         </h2>
                         <p className="text-slate-500 text-lg leading-relaxed font-medium line-clamp-3">
                           {truncate(featuredPost.content.replace(/[#*`]/g, ''), 200)}
                         </p>
                         <div className="pt-6">
                            <span className="flex items-center gap-3 text-sm font-black text-dark uppercase tracking-widest group-hover:gap-6 transition-all group-hover:text-primary">
                               Execute Full Review <ArrowRight className="w-5 h-5" />
                            </span>
                         </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}

              {/* Grid of Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {remainingPosts.map((post, idx) => (
                   <motion.div
                     key={post.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                   >
                     <Link to={`/blog/${post.slug}`} className="group block">
                       <div className="space-y-8">
                          <div className="aspect-[4/5] rounded-[3rem] overflow-hidden relative border border-slate-100 shadow-sm transition-shadow group-hover:shadow-2xl group-hover:shadow-slate-200/50">
                             <img 
                               src={post.featuredImage} 
                               alt={post.title}
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                             <div className="absolute top-8 left-8">
                                <Badge variant="primary" className="bg-white/90 backdrop-blur-md shadow-lg border-none text-dark">{post.category}</Badge>
                             </div>
                          </div>
                          <div className="space-y-4 px-4">
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{formatDate(post.createdAt, 'MMMM dd, yyyy')}</span>
                             </div>
                             <h3 className="text-2xl font-black text-dark tracking-tight leading-tight uppercase group-hover:text-primary transition-colors">
                               {post.title}
                             </h3>
                          </div>
                       </div>
                     </Link>
                   </motion.div>
                 ))}
              </div>

              {/* Load More/Pagination could go here */}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-dark py-32 text-center text-white overflow-hidden relative">
        <div className="container-custom relative z-10 space-y-12">
           <div className="badge-green mx-auto">Access intelligence</div>
           <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight uppercase italic font-serif">
             Stay Informed. <br/><span className="text-primary not-italic font-sans">Scale Impact.</span>
           </h2>
           <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed font-medium">
             Join over 2,000 strategic partners receiving our weekly cohort updates and clinical bulletins.
           </p>
           <form className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Digital address (email@provider.com)" 
                className="flex-grow px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:border-primary transition-all font-bold text-white"
              />
              <Button size="xl" className="rounded-[2rem]">Subscribe</Button>
           </form>
        </div>
        <div className="absolute -bottom-40 -left-20 text-white font-serif italic text-[20rem] opacity-[0.03] select-none rotate-12">
          INTELLIGENCE
        </div>
      </section>
    </div>
  );
}
