import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "deploy.config");

if (!existsSync(configPath)) {
  console.error(
    "Fichier deploy.config manquant.\n" +
      "  cp deploy.config.example deploy.config\n" +
      "  puis éditez DEPLOY_SSH et DEPLOY_DIR.",
  );
  process.exit(1);
}

const config = Object.fromEntries(
  readFileSync(configPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const ssh = config.DEPLOY_SSH;
const dir = config.DEPLOY_DIR?.replace(/\/$/, "");

if (!ssh || !dir) {
  console.error("deploy.config doit définir DEPLOY_SSH et DEPLOY_DIR.");
  process.exit(1);
}

const dist = resolve(root, "dist");
if (!existsSync(resolve(dist, "index.html"))) {
  console.error('Dossier dist/ absent. Lancez d\'abord : npm run build');
  process.exit(1);
}

const target = `${ssh}:${dir}/`;
const isWindows = process.platform === "win32";

console.log(`Déploiement dist/ → ${target}`);

try {
  if (isWindows) {
    execSync(`scp -r "${dist}/." "${target}"`, {
      stdio: "inherit",
      cwd: root,
      shell: true,
    });
  } else {
    execSync(`rsync -avz --delete "${dist}/" "${target}"`, {
      stdio: "inherit",
      cwd: root,
    });
  }
  console.log("Déploiement terminé.");
} catch {
  process.exit(1);
}
