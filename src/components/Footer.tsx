import { format } from 'date-fns';

export function Footer() {
  const currentYear = format(new Date(), 'yyyy');

  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Inshoyim. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
