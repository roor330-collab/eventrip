import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
          <div className="text-white text-lg animate-pulse">Chargement des résultats...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
