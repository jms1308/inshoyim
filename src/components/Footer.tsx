export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Notiq Insholar. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
