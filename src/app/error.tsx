'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="conteudo"><div className="panel notice"><h2>Não foi possível concluir a consulta.</h2><p className="muted mt-3">Tente novamente em alguns instantes.</p><button className="button mt-6" onClick={reset}>Tentar novamente</button></div></main>; }
