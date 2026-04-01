'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'am': return 'አማርኛ';
      case 'or': return 'Afaan Oromoo';
      default: return 'English';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 focus-visible:ring-0">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block font-medium">{getLanguageName(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-muted' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('am')} className={language === 'am' ? 'bg-muted' : ''}>
          አማርኛ
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('or')} className={language === 'or' ? 'bg-muted' : ''}>
          Afaan Oromoo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
