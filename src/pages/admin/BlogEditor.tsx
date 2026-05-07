import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Layout, FileText, ArrowLeft, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { firebaseService } from '@/src/services/firebaseService';
import { COLLECTIONS } from '@/src/constants';
import { BlogPost } from '@/src/types';
import { slugify, cn } from '@/src/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import ReactMarkdown from 'react-markdown';

export default function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [preview, setPreview] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    category: 'Mental Wellness',
    author: 'Editorial Team',
    status: 'draft',
    featuredImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070',
    tags: []
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const post = await firebaseService.getDoc<BlogPost>(COLLECTIONS.BLOG_POSTS, id);
          if (post) {
            setFormData(post);
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setFetching(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: slugify(title)
    }));
  };

  const handleSave = async (status: BlogPost['status'] = 'draft') => {
    if (!formData.title || !formData.content) {
      alert('Critical fields missing: Title and Content required.');
      return;
    }

    try {
      setLoading(true);
      const data = { ...formData, status };
      
      if (id) {
        await firebaseService.updateDoc(COLLECTIONS.BLOG_POSTS, id, data);
      } else {
        await firebaseService.addDoc(COLLECTIONS.BLOG_POSTS, data);
      }
      
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen space-x-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="font-black uppercase tracking-widest text-slate-400">Loading Article data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/admin/blog')}
             className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
           >
             <ArrowLeft className="w-6 h-6 text-slate-600" />
           </button>
           <div className="space-y-2">
             <Badge variant="primary">{id ? 'Edit Article' : 'New Deployment'}</Badge>
             <h1 className="text-4xl font-black text-dark tracking-tight uppercase leading-none">
               {id ? 'Refine Strategy' : 'Article Blueprint'}
             </h1>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
             {preview ? <Layout className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
             {preview ? 'Editor' : 'Preview'}
           </Button>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => handleSave('draft')}
             isLoading={loading}
           >
             Save Draft
           </Button>
           <Button 
             variant="primary" 
             size="sm" 
             onClick={() => handleSave('published')}
             isLoading={loading}
           >
             <Sparkles className="w-4 h-4 mr-2" />
             Publish
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           {preview ? (
             <Card className="p-12 prose max-w-none prose-slate prose-headings:font-black prose-headings:uppercase prose-pre:bg-slate-900 border-b-4 border-b-primary/10">
               <div className="mb-10 aspect-[21/9] rounded-3xl overflow-hidden">
                 <img src={formData.featuredImage} alt={formData.title} className="w-full h-full object-cover" />
               </div>
               <h1 className="text-5xl font-black text-dark tracking-tight uppercase leading-tight mb-8">
                 {formData.title || 'Untitled Article'}
               </h1>
               <div className="markdown-body">
                 <ReactMarkdown>{formData.content || '_No content yet._'}</ReactMarkdown>
               </div>
             </Card>
           ) : (
             <div className="space-y-10">
               <Card className="p-10 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-black text-dark uppercase tracking-tight">Core Metadata</h2>
                    <Input 
                      label="Strategic Title" 
                      placeholder="e.g. Scaling Mental Wellness in Sandton" 
                      value={formData.title}
                      onChange={handleTitleChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input 
                         label="URL Slug (System Managed)" 
                         placeholder="auto-generated-slug" 
                         value={formData.slug}
                         onChange={(e) => setFormData({...formData, slug: e.target.value})}
                       />
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Tag</label>
                         <select 
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                           className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl outline-none font-bold text-dark transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                         >
                            <option>Mental Wellness</option>
                            <option>Clinical Programs</option>
                            <option>Community News</option>
                            <option>Success Stories</option>
                         </select>
                       </div>
                    </div>
                  </div>
               </Card>

               <Card className="p-0 overflow-hidden">
                  <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                     <h2 className="text-lg font-black text-dark uppercase tracking-tight">Intelligence Content</h2>
                     <Badge variant="info">Markdown Supported</Badge>
                  </div>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Document the strategic narrative here (Markdown supported)..."
                    className="w-full min-h-[600px] p-10 focus:outline-none font-medium text-slate-600 leading-relaxed text-lg resize-y bg-slate-50/20"
                  />
               </Card>
             </div>
           )}
        </div>

        <div className="space-y-10">
           <Card className="p-8 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-dark font-black uppercase tracking-tight text-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span>Resource Visualization</span>
                 </div>
                 <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 group relative">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured" 
                      className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="primary" size="sm">Modify Media</Button>
                    </div>
                 </div>
                 <Input 
                   label="Featured Image Payload URL" 
                   value={formData.featuredImage}
                   onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                 />
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                 <div className="flex items-center gap-3 text-dark font-black uppercase tracking-tight text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Attribution</span>
                 </div>
                 <Input 
                   label="Strategic Author" 
                   value={formData.author}
                   onChange={(e) => setFormData({...formData, author: e.target.value})}
                 />
              </div>

              <div className="pt-8 border-t border-slate-50">
                <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Status</p>
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full animate-pulse",
                        formData.status === 'published' ? "bg-green-500" : "bg-amber-500"
                      )} />
                      <span className="font-black text-dark uppercase tracking-tight">{formData.status}</span>
                   </div>
                </div>
              </div>
           </Card>

           <Card className="bg-slate-900 border-slate-800 p-8 space-y-4">
              <h3 className="text-white font-black uppercase tracking-tight">Optimization Tips</h3>
              <ul className="space-y-3">
                 {[
                   'Use H2/H3 tags for better hierarchy',
                   'Include quality clinical imagery',
                   'Keep URLs short and keyword-dense',
                   'Attribute correctly to the cohort'
                 ].map((tip, idx) => (
                   <li key={idx} className="flex gap-2 text-slate-400 text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      {tip}
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>
    </div>
  );
}
