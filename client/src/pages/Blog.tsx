import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BlogPostList from "@/components/BlogPostList";
import BlogPostDetail from "@/components/BlogPostDetail";

export default function Blog() {
  const [location] = useLocation();
  const isPostDetail = location.match(/^\/blog\/([^/]+)/);
  
  // If URL is like /blog/[slug], show post detail
  if (isPostDetail) {
    return <BlogPostDetail />;
  }
  
  // Otherwise show blog list
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Notre Blog</h1>
        <p className="text-xl text-muted-foreground">
          Découvrez nos derniers articles, conseils et actualités sur les imprimantes et la technologie d'impression.
        </p>
      </div>
      
      <BlogPostList publishedOnly={true} />
    </div>
  );
}