import { Route, Routes } from "react-router-dom";
import { useVault } from "@/lib/hooks";
import { Topbar } from "@/components/Topbar";
import { Flash } from "@/components/Flash";
import { Library } from "@/routes/Library";
import { ReferenceDetail } from "@/routes/ReferenceDetail";
import { RecentlyRemoved } from "@/routes/RecentlyRemoved";

export default function App() {
  const { removed } = useVault();
  return (
    <div className="shell">
      <Topbar removedCount={removed.length} />
      <Flash />
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/r/:slug" element={<ReferenceDetail />} />
        <Route path="/removed" element={<RecentlyRemoved />} />
        <Route path="*" element={<Library />} />
      </Routes>
    </div>
  );
}
