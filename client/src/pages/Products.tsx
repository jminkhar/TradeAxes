import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ProductList from "@/components/ProductList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTag, faPrint, faBoxOpen, faThumbsUp, faCartShopping, faPhoneVolume } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'wouter';

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

function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('product-not-found');
        }
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      return data.data as Product;
    }
  });

  // Get similar products based on categories
  const { data: similarProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data as Product[];
    },
    enabled: !!product
  });

  // Filter out current product and get products with matching categories
  const filteredSimilarProducts = similarProducts?.filter(p => 
    p.id !== product?.id && 
    p.categories.some(cat => product?.categories.includes(cat))
  ).slice(0, 3);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-6" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if ((error as Error).message === 'product-not-found') {
      return (
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
          <p className="text-muted-foreground mb-8">
            Le produit que vous recherchez n'est pas disponible ou a été supprimé.
          </p>
          <Link href="/products">
            <Button>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Voir tous les produits
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="text-muted-foreground mb-8">
          Une erreur s'est produite lors du chargement du produit.
        </p>
        <Link href="/products">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Voir tous les produits
          </Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
        <p className="text-muted-foreground mb-8">
          Le produit que vous recherchez n'est pas disponible ou a été supprimé.
        </p>
        <Link href="/products">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Voir tous les produits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" className="group">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className="mr-2 transition-transform group-hover:-translate-x-1" 
            />
            Retour aux produits
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          {product.image ? (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faPrint} className="text-6xl text-muted-foreground" />
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
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {product.price && (
            <p className="text-2xl font-semibold mb-4">{product.price}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            {product.categories.map(category => (
              <Badge key={category} variant="secondary">
                <FontAwesomeIcon icon={faTag} className="mr-1" />
                {category}
              </Badge>
            ))}
          </div>
          
          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button size="lg">
              <FontAwesomeIcon icon={faCartShopping} className="mr-2" />
              Demander un devis
            </Button>
            <Button variant="outline" size="lg">
              <FontAwesomeIcon icon={faPhoneVolume} className="mr-2" />
              Nous contacter
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <Card className="shadow-sm border-primary/20">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <FontAwesomeIcon icon={faBoxOpen} className="text-primary text-2xl mb-2" />
                <p className="text-sm">Livraison gratuite en France métropolitaine</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-primary/20">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <FontAwesomeIcon icon={faThumbsUp} className="text-primary text-2xl mb-2" />
                <p className="text-sm">Garantie 1 an minimum</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-primary/20 col-span-2 sm:col-span-1">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <FontAwesomeIcon icon={faPhoneVolume} className="text-primary text-2xl mb-2" />
                <p className="text-sm">Support technique dédié</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {filteredSimilarProducts && filteredSimilarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {filteredSimilarProducts.map(product => (
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
                      <FontAwesomeIcon icon={faPrint} className="text-4xl text-muted-foreground" />
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
                
                <CardHeader className="pb-2">
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2 flex-grow">
                  <p className="text-muted-foreground line-clamp-2">
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
                    <Button variant="outline">Voir le produit</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const isProductDetail = location.match(/^\/products\/([^/]+)/);
  
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data as Product[];
    },
    enabled: !isProductDetail
  });

  // Extract unique categories from products
  const allCategories = products?.flatMap(p => p.categories) || [];
  const categories = Array.from(new Set(allCategories));
  
  // Set the first category as active if none is selected
  useEffect(() => {
    if (categories.length > 0 && activeTab === "all") {
      // Keep "all" as default
    }
  }, [categories]);
  
  // If URL is like /products/[slug], show product detail
  if (isProductDetail) {
    return <ProductDetail />;
  }
  
  // Otherwise show products list
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Nos Produits</h1>
        <p className="text-xl text-muted-foreground">
          Découvrez notre gamme complète d'imprimantes professionnelles et d'équipements d'impression.
        </p>
      </div>
      
      {categories.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-center mb-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">Tous</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <ProductList />
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <ProductList categoryFilter={category} />
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {!categories.length && <ProductList />}
    </div>
  );
}