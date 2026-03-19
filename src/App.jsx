return (
  <div className="container">
    <div className="h1">Tech Labor Validator (Web)</div>
    <p className="subtitle">
      Enter full date & time (e.g., <code>19-FEB-2026 06:10:00</code> or <code>3/16/2026 07:27</code>). Adjust rule times below.
    </p>

    <div className="grid grid-2">
      {/* Left: Inputs */}
      <div className="card"><div className="content">
        <div className="section-title">Inputs</div>
        <div className="row">
          <div>
            <label className="label">Arrival</label>
            <input className="input" placeholder="19-FEB-2026 06:10:00"
                   value={arrivalText} onChange={e=>setArrivalText(e.target.value)} />
          </div>
          <div>
            <label className="label">Departure</label>
            <input className="input" placeholder="19-FEB-2026 08:30:00"
                   value={departureText} onChange={e=>setDepartureText(e.target.value)} />
          </div>
        </div>
        <div className="row" style={{marginTop:12}}>
          <div>
            <label className="label">Break (minutes)</label>
            <input className="number" type="number" min={0}
                   value={breakMin} onChange={e=>setBreakMin(e.target.value)} />
          </div>
          <div>
            <label className="label">Tie‑Breaker (when RG = OT)</label>
            <select className="select" value={tieBreaker} onChange={e=>setTieBreaker(e.target.value)}>
              <option value="RG">RG</option>
              <option value="OT">OT</option>
            </select>
          </div>
        </div>
      </div></div>

      {/* Right: Parameters */}
      <div className="card"><div className="content">
        <div className="section-title">Parameters</div>
        <div className="row">
          <div><label className="label">RG Start</label>
            <input className="input" value={params.RG_Start_Time}
                   onChange={e=>setParams(p=>({...p, RG_Start_Time:e.target.value}))}/></div>
          <div><label className="label">RG End</label>
            <input className="input" value={params.RG_End_Time}
                   onChange={e=>setParams(p=>({...p, RG_End_Time:e.target.value}))}/></div>

          <div><label className="label">Buffer Morning Start</label>
            <input className="input" value={params.Buffer_Morning_Start_Time}
                   onChange={e=>setParams(p=>({...p, Buffer_Morning_Start_Time:e.target.value}))}/></div>
          <div><label className="label">Buffer Morning End</label>
            <input className="input" value={params.Buffer_Morning_End_Time}
                   onChange={e=>setParams(p=>({...p, Buffer_Morning_End_Time:e.target.value}))}/></div>

          <div><label className="label">Buffer Evening Start</label>
            <input className="input" value={params.Buffer_Evening_Start_Time}
                   onChange={e=>setParams(p=>({...p, Buffer_Evening_Start_Time:e.target.value}))}/></div>
          <div><label className="label">Buffer Evening End</label>
            <input className="input" value={params.Buffer_Evening_End_Time}
                   onChange={e=>setParams(p=>({...p, Buffer_Evening_End_Time:e.target.value}))}/></div>

          <div><label className="label">Hold Evening Start</label>
            <input className="input" value={params.Hold_Evening_Start_Time}
                   onChange={e=>setParams(p=>({...p, Hold_Evening_Start_Time:e.target.value}))}/></div>
          <div><label className="label">Hold Morning End</label>
            <input className="input" value={
