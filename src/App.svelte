<script>
  import { Router, Link, Route } from "svelte-routing";
  import FileUpload from "./components/FileUpload.svelte";
  import Results from "./components/Results.svelte";

  export let url = "";
</script>

<Router {url}>
  <nav>
    <Link to="/">Subir Archivo</Link>
    <Link to="/results">Resultados</Link>
  </nav>

  <main>
    <Route path="/"><FileUpload /></Route>
    <Route path="/results"><Results /></Route>
  </main>
</Router>

<style>
  nav {
    padding: 1rem;
    background-color: #f0f0f0;
  }
  nav :global(a) {
    padding: 0.5rem;
    color: #333;
    text-decoration: none;
  }
  nav :global(a:hover) {
    background-color: #ddd;
  }
  main {
    padding: 1rem;
  }
</style>