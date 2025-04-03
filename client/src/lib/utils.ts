import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: offsetTop - 80, // Accounting for header height
      behavior: 'smooth'
    });
  }
};
