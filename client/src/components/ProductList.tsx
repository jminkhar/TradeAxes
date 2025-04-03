import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  price: string | null;
  categories: string[];
  badge: {
    text: string;
    color: string;
  } | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductListProps {
  featuredOnly?: boolean;
  limit?: number;
  showViewAllButton?: boolean;
  categoryFilter?: string;
}

export default function ProductList({ 
  featuredOnly = false,
  limit,
  showViewAllButton = false,
  categoryFilter
}: ProductListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data as Product[];
    }
  });

  const filteredProducts = data?.filter(product => {
    if (featuredOnly && !product.featured) return false;
    if (categoryFilter && !product.categories.includes(categoryFilter)) return false;
    return true;
  });

  const displayProducts = limit ? filteredProducts?.slice(0, limit) : filteredProducts;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(limit || 4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <Skeleton className="h-48 w-full rounded-t-lg" />
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
          Impossible de charger les produits. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  if (!displayProducts?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Aucun produit disponible
        </h3>
        <p className="text-gray-600">
          {categoryFilter 
            ? `Aucun produit dans la catégorie "${categoryFilter}".` 
            : 'Revenez bientôt pour découvrir nos produits.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayProducts.map(product => (
          <Card key={product.id} className="shadow-sm overflow-hidden flex flex-col h-full group">
            <div className="relative">
              {product.image ? (
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-4xl text-muted-foreground" />
                </div>
              )}
              
              {product.badge && (
                <Badge 
                  className={`absolute top-3 right-3 ${
                    product.badge.color === 'red' ? 'bg-red-500' : 
                    product.badge.color === 'green' ? 'bg-green-500' : 
                    product.badge.color === 'blue' ? 'bg-blue-500' : 
                    'bg-yellow-500'
                  } text-white`}
                >
                  {product.badge.text}
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-2 flex-grow">
              <CardTitle className="line-clamp-2">{product.name}</CardTitle>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {product.categories.slice(0, 3).map(category => (
                  <Badge key={category} variant="outline" className="font-normal">
                    <FontAwesomeIcon icon={faTag} className="mr-1 text-xs" />
                    {category}
                  </Badge>
                ))}
                
                {product.categories.length > 3 && (
                  <Badge variant="outline">+{product.categories.length - 3}</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-muted-foreground line-clamp-3">
                {product.description}
              </p>
              
              {product.price && (
                <p className="text-lg font-semibold mt-2">
                  {product.price}
                </p>
              )}
            </CardContent>
            
            <CardFooter className="pt-2">
              <Link href={`/products/${product.slug}`}>
                <Button variant="default">Détails</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {showViewAllButton && filteredProducts && filteredProducts.length > (limit || 0) && (
        <div className="text-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Voir tous les produits
              {categoryFilter ? ` de ${categoryFilter}` : ''}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}