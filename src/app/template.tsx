import { PageTransition } from "@/components/PageTransition";

// Next.js re-mounts template.tsx on every navigation, giving us a clean
// per-route enter animation without manual route keys.
export default function Template({ children }: { children: React.ReactNode }) {
    return <PageTransition>{children}</PageTransition>;
}
