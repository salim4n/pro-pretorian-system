export default function Footer() {
  return (
    <footer className="bg-muted py-12 mt-3">
      <div className="container max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <h3 className="text-2xl font-bold">IgnitionAI</h3>
        <p className="text-muted-foreground">
          Nos technologies de pointe et notre approche innovante de la
          résolution de problèmes révolutionneront votre façon de travailler.
          Découvrez l'avenir de la productivité avec nos outils et
          fonctionnalités de pointe.
        </p>
      </div>
      <img
        src="/ignitionAI.jpg"
        width="60"
        height="60"
        alt="Presentation"
        className="rounded-full object-cover"
      />
    </footer>
  )
}
