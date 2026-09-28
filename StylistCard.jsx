import { useEffect, useState } from 'react';
import { getRecommendations } from '../lib/api';

// The visible "it learned about me" moment: shows reflect() output + how many memories were used.
export default function StylistCard({ userId, catalog, refreshKey, onRanked }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    getRecommendations(userId, catalog).then((d) => { setData(d); if (d) onRanked?.(d.ranked); });
  }, [userId, refreshKey]);
  if (!data) return <div className="p-4 text-sm text-gray-500">Your stylist is getting to know you…</div>;
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xl">
      <div className="text-xs uppercase tracking-widest opacity-80">Stylist memory · {data.memoriesUsed} moments recalled</div>
      <p className="mt-2 text-lg leading-snug">{data.why || 'Try a few outfits — I learn from every one.'}</p>
    </div>
  );
}
