import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home" },
      { name: "description", content: "Bem-vindo ao nosso app." },
      { property: "og:title", content: "Home" },
      { property: "og:description", content: "Bem-vindo ao nosso app." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold">Meu App</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Sobre
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Contato
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bem-vindo à Home
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Esta é a tela inicial do seu app. Você pode personalizar o conteúdo, adicionar seções e começar a construir sua experiência.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Começar
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Saiba mais
          </Link>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Meu App. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

