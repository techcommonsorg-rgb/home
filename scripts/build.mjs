import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root = resolve(process.cwd());
const dist = join(root, 'dist');
const staticDir = join(dist, 'static');
rmSync(dist, { recursive: true, force: true });
mkdirSync(staticDir, { recursive: true });
for (const entry of ['index.html','404.html','favicon.ico','robots.txt','sitemap.xml','.nojekyll','assets','programs','hackathon','magazine','about','get-involved','contact','safeguarding','privacy','accessibility']) {
  const source = join(root, entry);
  if (!existsSync(source)) throw new Error(`Missing build input: ${entry}`);
  cpSync(source, join(staticDir, entry), { recursive: true });
}
const serverDir = join(dist, 'server');
mkdirSync(serverDir, { recursive: true });
writeFileSync(join(serverDir, 'index.js'), `export default {\n  async fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  }\n};\n`);
const hostingDir = join(dist, '.openai');
mkdirSync(hostingDir, { recursive: true });
cpSync(join(root, '.openai', 'hosting.json'), join(hostingDir, 'hosting.json'));
console.log('Built static GitHub Pages output and Sites-compatible worker in dist/.');
