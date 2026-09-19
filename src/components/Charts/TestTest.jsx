import { useMemo } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Mock data — replace with real data, e.g.                           */
/*  invoke<Position[]>('get_positions') from your Tauri backend        */
/* ------------------------------------------------------------------ */

const MOCK_POSITIONS = [
    { id: '1', symbol: 'NVDA', side: 'long',  qty: 40, entryPrice: 171.2, lastPrice: 178.45, status: 'open' },
    { id: '2', symbol: 'TSLA', side: 'short', qty: 25, entryPrice: 388.5, lastPrice: 372.9,  status: 'open' },
    { id: '3', symbol: 'AAPL', side: 'long',  qty: 60, entryPrice: 229.8, lastPrice: 227.1,  status: 'open' },
    { id: '4', symbol: 'AMD',  side: 'short', qty: 40, entryPrice: 168.3, lastPrice: 172.6,  status: 'open' },
    { id: '5', symbol: 'SPY',  side: 'long',  qty: 15, entryPrice: 668.1, lastPrice: 671.55, status: 'closed' },
    { id: '6', symbol: 'META', side: 'long',  qty: 18, entryPrice: 742.6, lastPrice: 738.48, status: 'closed' },
];

/** signed P/L of one position in USD */
const positionPnl = (p) =>
    (p.lastPrice - p.entryPrice) * p.qty * (p.side === 'long' ? 1 : -1);

/** mock intraday cumulative P/L curve (deterministic), ends at the book's total */
const MOCK_CURVE = (() => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const walk = [];
    let v = 0;
    for (let i = 0; i < 27; i++) {
        v += (rnd() - 0.45) * 45;
        walk.push(v);
    }
    const total = MOCK_POSITIONS.reduce((s, p) => s + positionPnl(p), 0);
    const last = walk[walk.length - 1];
    return walk.map((w, i) => {
        const m = 9 * 60 + 30 + i * 15; // 09:30 → 16:00
        return {
            t: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
            pnl: +(w + ((total - last) * i) / (walk.length - 1)).toFixed(2),
        };
    });
})();

/* ------------------------------ helpers ------------------------------ */

const fmtUsd = (v) =>
    `${v < 0 ? '-' : '+'}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtAxis = (v) =>
    `${v < 0 ? '-' : ''}$${Math.abs(v) >= 1000 ? `${(Math.abs(v) / 1000).toFixed(1)}k` : Math.abs(v).toFixed(0)}`;

function PnlTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    return (
        <div className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs shadow-lg">
            <div className="text-zinc-500">{label}</div>
            <div className={`font-semibold tabular-nums ${v >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtUsd(v)}
            </div>
        </div>
    );
}

/* ----------------------------- component ----------------------------- */

export function PnlPanel({ positions = MOCK_POSITIONS, curve = MOCK_CURVE }) {
    const stats = useMemo(() => {
        const open = positions.filter((p) => p.status === 'open');
        const closed = positions.filter((p) => p.status === 'closed');
        const unrealized = open.reduce((s, p) => s + positionPnl(p), 0);
        const realized = closed.reduce((s, p) => s + positionPnl(p), 0);
        const wins = closed.filter((p) => positionPnl(p) > 0).length;
        return {
            total: unrealized + realized,
            unrealized,
            realized,
            openCount: open.length,
            longs: open.filter((p) => p.side === 'long').length,
            winRate: closed.length ? (wins / closed.length) * 100 : 0,
        };
    }, [positions]);

    const up = stats.total >= 0;

    return (
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            {/* header: title + total P/L */}
            <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          P/L today
        </span>
                <span className={`text-xl font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {fmtUsd(stats.total)}
        </span>
            </div>

            {/* simple stats */}
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <div>
                    <div className="text-zinc-500">Unrealized</div>
                    <div className={`mt-0.5 font-medium tabular-nums ${stats.unrealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fmtUsd(stats.unrealized)}
                    </div>
                </div>
                <div>
                    <div className="text-zinc-500">Realized</div>
                    <div className={`mt-0.5 font-medium tabular-nums ${stats.realized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fmtUsd(stats.realized)}
                    </div>
                </div>
                <div>
                    <div className="text-zinc-500">Win rate</div>
                    <div className="mt-0.5 font-medium tabular-nums text-zinc-200">
                        {stats.winRate.toFixed(0)}%
                    </div>
                </div>
                <div>
                    <div className="text-zinc-500">Open</div>
                    <div className="mt-0.5 font-medium tabular-nums text-zinc-200">
                        {stats.openCount} <span className="text-zinc-500">({stats.longs}L)</span>
                    </div>
                </div>
            </div>

            {/* P/L line chart */}
            <div className="mt-4 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={curve} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="pnl-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={up ? '#34d399' : '#fb7185'} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={up ? '#34d399' : '#fb7185'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={40} />
                        <YAxis tickFormatter={fmtAxis} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={46} />
                        <Tooltip content={PnlTooltip} cursor={{ stroke: '#52525b', strokeDasharray: '4 4' }} />
                        <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 4" />
                        <Area dataKey="pnl" type="monotone" stroke="none" fill="url(#pnl-fill)" />
                        <Line dataKey="pnl" type="monotone" stroke={up ? '#34d399' : '#fb7185'} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default PnlPanel;