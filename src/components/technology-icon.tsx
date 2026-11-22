import { CodeXml, Gamepad2 } from "lucide-react";
import {
  siBootstrap, siCapacitor, siCss, siExpress, siFigma, siFirebase, siHtml5,
  siJavascript, siJquery, siMysql, siNextdotjs, siNodedotjs, siPhp, siPostgresql,
  siReact, siSupabase, siSwift, siTailwindcss, siTypescript, siWordpress,
} from "simple-icons";

const icons: Record<string, { path: string }> = {
  html: siHtml5, css: siCss, bootstrap: siBootstrap, javascript: siJavascript,
  typescript: siTypescript, react: siReact, jquery: siJquery, figma: siFigma,
  nextjs: siNextdotjs, tailwind: siTailwindcss, capacitor: siCapacitor,
  "react-native": siReact, mysql: siMysql, wordpress: siWordpress, php: siPhp,
  nodeJs: siNodedotjs, express: siExpress, postgresql: siPostgresql, swift: siSwift,
  firebase: siFirebase, supabase: siSupabase,
};

export function TechnologyIcon({ name }: { name: string }) {
  if (name === "gb-studio") return <Gamepad2 aria-hidden="true" className="size-[1em]" />;

  const icon = icons[name];
  if (!icon) return <CodeXml aria-hidden="true" className="size-[1em]" />;

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1em]" fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}
