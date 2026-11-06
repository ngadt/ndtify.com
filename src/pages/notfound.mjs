export function notFound() {
  return {
    path: '/404.html',
    noindex: true,
    title: 'Page not found | NDTify',
    description: 'The page you are looking for does not exist.',
    body: `
    <section class="page-hero page-hero--center">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        <p class="kicker kicker--light">Error 404</p>
        <h1>This page doesn’t exist</h1>
        <p class="lead">It may have moved when we rebuilt the site. Try one of these instead:</p>
        <div class="hero-cta">
          <a href="/" class="btn btn-primary btn-lg">Home</a>
          <a href="/work/" class="btn btn-outline btn-lg">Our work</a>
          <a href="/services/" class="btn btn-outline btn-lg">Services</a>
        </div>
      </div>
    </section>`,
  };
}
