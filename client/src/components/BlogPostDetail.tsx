import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faTag, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/blog', slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('post-not-found');
        }
        throw new Error('Failed to fetch blog post');
      }
      const data = await response.json();
      return data.data as BlogPost;
    }
  });

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
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-6" />
        </div>
        
        <Skeleton className="h-12 w-full mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <Skeleton className="aspect-video w-full mb-8" />
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    if ((error as Error).message === 'post-not-found') {
      return (
        <div className="container max-w-4xl py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Article introuvable</h2>
          <p className="text-muted-foreground mb-8">
            L'article que vous recherchez n'est pas disponible ou a été supprimé.
          </p>
          <Link href="/blog">
            <Button>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Retourner au blog
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="container max-w-4xl py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="text-muted-foreground mb-8">
          Une erreur s'est produite lors du chargement de l'article.
        </p>
        <Link href="/blog">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retourner au blog
          </Button>
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Article introuvable</h2>
        <p className="text-muted-foreground mb-8">
          L'article que vous recherchez n'est pas disponible ou a été supprimé.
        </p>
        <Link href="/blog">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retourner au blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/blog">
          <Button variant="ghost" className="group">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className="mr-2 transition-transform group-hover:-translate-x-1" 
            />
            Retour aux articles
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faCalendarAlt} />
          {formatDate(post.publishedAt || post.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faUser} />
          {post.author}
        </span>
        <Badge variant="secondary" className="font-normal">
          <FontAwesomeIcon icon={faTag} className="mr-1" />
          {post.category}
        </Badge>
      </div>

      {post.image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {post.content.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}