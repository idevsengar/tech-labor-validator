import { useMemo, useState } from "react";

/** --- UTILITIES --- */
function toDate(value){
  // Accepts "19-FEB-2026 06:10:00" or "3/16/2026 07:27"
  if (!value) return null;
  const d = new Date(value);
  if (!isNaN(d)) return d;
  const m = value.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  if (m){
    const [, dd, mon, yyyy, HH, mm, ss] = m;
    return new Date(Number(yyyy), months[mon], Number(dd), Number(HH), Number(mm), Number(ss||0));
  }
  return null;
}
const hours = ms => Math.max(0, ms)/3600000;
function setTime(baseDate, hhmmss){
  const [h,m,s] = (hhmmss||"0:0:0").split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h||0, m||0, s||0, 0); return d;
}
function overlapHours(A,B,C,D){
  const start = Math.max(A.getTime(), C.getTime());
  const end   = Math.min(B.getTime(), D.getTime());
  return hours(end - start);
}

function classify({arrival, departure, breakMin, params, tieBreaker}){
  if (!arrival || !departure) return {rg:0,ot:0,hold:0,total:0,final:""};

  // Overnight adjust
  let adjEnd = new Date(departure);
  if (adjEnd.getTime() < arrival.getTime()) adjEnd = new Date(adjEnd.getTime()+24*3600*1000);

  // Windows based on arrival day
  const day = new Date(arrival);
  const RG_S = setTime(day, params.RG_Start_Time);
  const RG_E = setTime(day, params.RG_End_Time);
  const BM_S = setTime(day, params.Buffer_Morning_Start_Time);
  const BM_E = setTime(day, params.Buffer_Morning_End_Time);
  const BE_S = setTime(day, params.Buffer_Evening_Start_Time);
  const BE_E = setTime(day, params.Buffer_Evening_End_Time);
  const H_EVE_S = setTime(day, params.Hold_Evening_Start_Time);
  const H_MORN_E = setTime(day, params.Hold_Morning_End_Time);

  // Day bounds
  const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
  const dayEnd   = new Date(day); dayEnd.setHours(24,0,0,0);
  const nextMorningEnd = setTime(new Date(dayEnd), params.Hold_Morning_End_Time);

  // Overlaps
  const rg = overlapHours(arrival, adjEnd, RG_S, RG_E);
  const ot = overlapHours(arrival, adjEnd, BM_S, BM_E) + overlapHours(arrival, adjEnd, BE_S, BE_E);
  const hold = overlapHours(arrival, adjEnd, dayStart, H_MORN_E)
             + overlapHours(arrival, adjEnd, H_EVE_S, dayEnd)
             + overlapHours(arrival, adjEnd, dayEnd, nextMorningEnd);

  const total = Math.max(0, hours(adjEnd - arrival) - (Number(breakMin)||0)/60);

  let final = "";
  if (hold > 0) final = "Put on hold for clarification";
  else if (ot > rg) final = "OT";
  else if (rg > ot) final = "RG";
  else final = (tieBreaker === "OT" ? "OT" : "RG");

  return {rg, ot, hold, total, final};
}

function roundTo(x, step){ if (!step || step<=0) return x; return Math.round(x/step)*step; }

export default function App(){
  // Defaults: 7–4 RG, buffers, hold, rounding
  const [params, setParams] = useState({
    RG_Start_Time: "07:00:00",
    RG_End_Time: "16:00:00",
    Buffer_Morning_Start_Time: "06:00:00",
    Buffer_Morning_End_Time: "08:00:00",
    Buffer_Evening_Start_Time: "16:00:00",
    Buffer_Evening_End_Time: "18:00:00",
    Hold_Evening_Start_Time: "18:00:00",
    Hold_Morning_End_Time: "06:00:00",
    Round_To: 0.25
  });
  const [tieBreaker, setTieBreaker] = useState("RG");

  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [breakMin, setBreakMin] = useState(0);

  const parsed = useMemo(()=>({ a:toDate(arrival), d:toDate(departure) }), [arrival, departure]);
  const res = useMemo(()=> classify({
    arrival: parsed.a, departure: parsed.d, breakMin, params, tieBreaker
  }), [parsed, breakMin, params, tieBreaker]);

  const rounded = roundTo(res.total, params.Round_To);

  return (
    <div className="container">
      <div className="h1">Tech Labor Validator (Web)</div>
      <p className="subtle">Enter full date & time (e.g., <code>19-FEB-2026 06:10:00</code> or <code>3/16/2026 07:27</code>). Adjust rule times below.</p>

      <div className="grid grid-2">
        <div className="card"><div className="content">
          <div className="row">
            <div>
              <label className="label">Arrival</label>
              <input className="input" placeholder="19-FEB-2026 06:10:00" value={arrival} onChange={e=>setArrival(e.target.value)}/>
            </div>
            <div>
              <label className="label">Departure</label>
              <input className="input" placeholder="19-FEB-2026 08:30:00" value={departure} onChange={e=>setDeparture(e.target.value)}/>
            </div>
          </div>
          <div className="row" style={{marginTop:12}}>
            <div>
              <label className="label">Break (minutes)</label>
              <input className="number" type="number" min="0" value={breakMin} onChange={e=>setBreakMin(e.target.value)}/>
            </div>
            <div>
              <label className="label">Tie-Breaker (when RG=OT)</label>
              <select className="input" value={tieBreaker} onChange={e=>setTieBreaker(e.target.value)}>
                <option value="RG">RG</option>
                <option value="OT">OT</option>
              </select>
            </div>
          </div>
        </div></div>

        <div className="card"><div className="content">
          <div className="row">
            <div>
              <label className="label">RG Start</label>
              <input className="input" value={params.RG_Start_Time} onChange={e=>setParams(p=>({...p, RG_Start_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">RG End</label>
              <input className="input" value={params.RG_End_Time} onChange={e=>setParams(p=>({...p, RG_End_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Buffer Morning Start</label>
              <input className="input" value={params.Buffer_Morning_Start_Time} onChange={e=>setParams(p=>({...p, Buffer_Morning_Start_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Buffer Morning End</label>
              <input className="input" value={params.Buffer_Morning_End_Time} onChange={e=>setParams(p=>({...p, Buffer_Morning_End_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Buffer Evening Start</label>
              <input className="input" value={params.Buffer_Evening_Start_Time} onChange={e=>setParams(p=>({...p, Buffer_Evening_Start_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Buffer Evening End</label>
              <input className="input" value={params.Buffer_Evening_End_Time} onChange={e=>setParams(p=>({...p, Buffer_Evening_End_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Hold Evening Start</label>
              <input className="input" value={params.Hold_Evening_Start_Time} onChange={e=>setParams(p=>({...p, Hold_Evening_Start_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Hold Morning End</label>
              <input className="input" value={params.Hold_Morning_End_Time} onChange={e=>setParams(p=>({...p, Hold_Morning_End_Time:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Round to (hrs)</label>
              <input className="number" type="number" step="0.01" value={params.Round_To} onChange={e=>setParams(p=>({...p, Round_To:parseFloat(e.target.value)||0}))}/>
            </div>
          </div>
        </div></div>
      </div>

      <div className="card" style={{marginTop:16}}><div className="content">
        <div style={{fontWeight:600, marginBottom:8}}>Results</div>
        {(!parsed.a || !parsed.d) ? (
          <div className="subtle">Enter Arrival and Departure to see results.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="table">
              <thead>
                <tr><th>Arrival</th><th>Departure</th><th>RG</th><th>OT Buffer</th><th>Hold</th><th>Final Classification</th><th>Billable Hrs</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{parsed.a?.toLocaleString()}</td>
                  <td>{parsed.d?.toLocaleString()}</td>
                  <td>{res.rg.toFixed(2)}</td>
                  <td>{res.ot.toFixed(2)}</td>
                  <td>{res.hold.toFixed(2)}</td>
                  <td>
                    {res.final==="Put on hold for clarification" ? <span className="badge hold">Hold</span> :
                     res.final==="OT" ? <span className="badge ot">OT</span> :
                     res.final ? <span className="badge rg">RG</span> : ""}
                    <span style={{marginLeft:8}}>{res.final}</span>
                  </td>
                  <td style={{fontWeight:600}}>{rounded.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="subtle" style={{marginTop:6}}>
          Logic: If any Hold overlap exists (18:00–06:00 by default), label “Put on hold for clarification”. Otherwise compare RG vs OT Buffer; heavier side wins; ties use Tie‑Breaker. Billable Hrs = (Departure−Arrival−Break) rounded to your step.
        </div>
      </div></div>
    </div>
  );
}
