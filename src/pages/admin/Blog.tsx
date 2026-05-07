import React from 'react';
import { Plus, Search, Filter, FileText, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/src/hooks/useCollection';
import { COLLECTIONS } from '@/src/constants';
import { BlogPost } from '@/src/types';
import { orderBy } from 'firebase/firestore';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { formatDate, truncate } from '@/src/utils';
import { firebaseService } from '@/src/services/firebaseService';

export default function AdminBlog() {
  const { data: posts, loading } = useCollection<BlogPost>(COLLECTIONS.BLOG_POSTS, {
    constraints: [orderBy('createdAt', 'desc')],
    realtime: true
  });

  const [searchTerm, setSearchTerm] = React.useState('');

  const deletePost = async (id: string) => {
    if (window.confirm('Delete this article? This action cannot be undone.')) {
      try {
        await firebaseService.deleteDoc(COLLECTIONS.BLOG_POSTS, id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <Badge variant="info">Communications</Badge>
          <h1 className="text-4xl font-black text-dark tracking-tight uppercase">Article <br/>Repository</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search articles..." 
              className="pl-14"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/admin/blog/new">
            <Button size="sm" className="w-full sm:w-auto h-[58px]">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-slate-50">
               <div className="h-full w-full" />
            </Card>
          ))
        ) : filteredPosts.map((post) => (
          <Card key={post.id} hoverable className="p-0 overflow-hidden flex flex-col group border-b-4 border-b-primary/10">
            <div className="aspect-[16/9] relative overflow-hidden">
               <img 
                 src={post.featuredImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070'} 
                 alt={post.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute top-6 right-6">
                 <Badge variant={post.status === 'published' ? 'success' : 'warning'} className="shadow-lg backdrop-blur-md bg-white/90">
                   {post.status}
                 </Badge>
               </div>
            </div>
            <div className="p-8 space-y-4 flex-grow">
               <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                  <FileText className="w-3 h-3" />
                  <span>{post.category}</span>
                  <span className="text-slate-300">•</span>
                  <span>{formatDate(post.createdAt)}</span>
               </div>
               <h3 className="text-xl font-black text-dark tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                 {post.title}
               </h3>
               <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3">
                 {truncate(post.content.replace(/[#*`]/g, ''), 120)}
               </p>
            </div>
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center font-black text-[10px] text-white">
                    {post.author.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black text-dark uppercase tracking-tight">{post.author}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Link to={`/admin/blog/edit/${post.id}`}>
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </Card>
        ))}
        {!loading && filteredPosts.length === 0 && (
          <div className="col-span-full py-40 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <FileText className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-dark uppercase tracking-tight">No Articles Found</h3>
             <p className="text-slate-400 text-sm font-medium">Initiate your first article deployment to begin outreach.</p>
          </div>
        )}
      </div>
    </div>
  );
}
