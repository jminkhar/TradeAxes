import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faTag } from '@fortawesome/free-solid-svg-icons';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostListProps {
  publishedOnly?: boolean;
  limit?: number;
  showViewAllButton?: boolean;
}

export default function BlogPostList({ 
  publishedOnly = true,
  limit,
  showViewAllButton = false
}: BlogPostListProps) {
  const [expanded, setExpanded] = useState<number[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/blog', { published: publishedOnly }],
    queryFn: async () => {
      const response = await fetch(`/api/blog?published=${publishedOnly}`);
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      const data = await response.json();
      return data.data as BlogPost[];
    }
  });

  const toggleExpand = (id: number) => {
    setExpanded(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non publié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <Skeleton className="h-40 w-full rounded-t-lg" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600">
          Impossible de charger les articles. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  const displayPosts = limit ? data?.slice(0, limit) : data;

  if (!displayPosts?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Aucun article disponible
        </h3>
        <p className="text-gray-600">
          Revenez bientôt pour découvrir nos actualités.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map(post => (
          <Card key={post.id} className="shadow-sm overflow-hidden flex flex-col">
            {post.image && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faUser} className="text-xs" />
                  {post.author}
                </span>
              </div>
              
              <CardTitle>{post.title}</CardTitle>
              
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="font-normal">
                  <FontAwesomeIcon icon={faTag} className="mr-1 text-xs" />
                  {post.category}
                </Badge>
                
                {post.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
                
                {post.tags.length > 2 && (
                  <Badge variant="outline">+{post.tags.length - 2}</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2 flex-grow">
              <p className="text-muted-foreground">
                {post.excerpt || post.content.substring(0, 120)}
                {!post.excerpt && post.content.length > 120 && '...'}
              </p>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Link href={`/blog/${post.slug}`}>
                <Button variant="outline">Lire plus</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {showViewAllButton && data && data.length > (limit || 0) && (
        <div className="text-center mt-8">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              Voir tous les articles
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}