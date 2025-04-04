import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Définir le schéma de validation du formulaire de connexion
const loginSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        
        // Rediriger vers le tableau de bord d'administration
        setLocation("/admin");
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: errorData.message || "Identifiants incorrects",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username: "admin",
          password: "admin123",
          isAdmin: true
        })
      });
      
      if (res.ok) {
        toast({
          title: "Compte administrateur créé",
          description: "Vous pouvez maintenant vous connecter avec admin/admin123",
        });
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Erreur de création de compte",
          description: errorData.message || "Erreur lors de la création du compte administrateur",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du compte",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Section gauche : Formulaire de connexion */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-red-600">Axes</span>
              <span className="text-blue-600">Trade</span>
            </h1>
            <p className="mt-2 text-gray-600">Connectez-vous pour accéder au panneau d'administration</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleCreateAdmin}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Créer un compte administrateur par défaut
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Cliquez sur ce bouton pour créer un compte admin avec les identifiants par défaut (admin/admin123)
            </p>
          </div>
        </div>
      </div>

      {/* Section droite : Informations sur le site */}
      <div className="hidden md:block md:w-1/2 bg-blue-600 text-white p-8">
        <div className="flex flex-col h-full justify-center">
          <h2 className="text-4xl font-bold mb-6">Panneau d'administration AxesTrade</h2>
          <p className="text-xl mb-8">
            Gérez facilement vos produits, articles de blog, et interagissez avec vos clients.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Gestion complète des produits
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Publication d'articles de blog
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Messages de contact des clients
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Statistiques de visites et d'utilisation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}