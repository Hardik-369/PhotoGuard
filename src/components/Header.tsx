import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-yellow rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">PhotoGuard</h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">100% Private & Secure</span>
          </div>
        </div>
      </div>
    </header>
  );
};