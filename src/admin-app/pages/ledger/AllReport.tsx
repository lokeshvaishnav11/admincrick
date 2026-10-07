import React, { useCallback, useEffect, useMemo, useState } from "react";
import betService from "../../../services/bet.service";
import ReportModal from "./ReportModal";
import { useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";

type LedgerEntry = {
  ChildId?: string;
  ParentId?: string;
  username?: string;
  cname?: string;
  superShare?: number | string;
  Fancy?: boolean;
  casinostatus?: boolean;
  narration?: string;
  fammount?: number | string;
  commissiondega?: number | string;
  createdAt?: string;
  settled?: boolean;
};

type ReportRow = {
  id: string;
  client: string;
  cname: string;
  ss: number;
  match: number;
  casino: number;
  session: number;
  matka: number;
  totall: number;
  mCom: number;
  cCom: number;
  sCom: number;
  mtCom: number;
  tCom: number;
  gTotal: number;
  upDownShare: number;
  balance: number;
};

type NumericKey = Exclude<keyof ReportRow, "id" | "client" | "cname">;
const amount = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const moneyText = (value: number) => value.toFixed(2);
const tone = (value: number) => value < 0 ? "text-danger" : "text-success";

const columns: Array<{ label: string; key: NumericKey }> = [
  { label: "Match (+/-)", key: "match" },
  { label: "Casino (+/-)", key: "casino" },
  { label: "Session (+/-)", key: "session" },
  { label: "Matka (+/-)", key: "matka" },
  { label: "Total", key: "totall" },
  { label: "M.Com", key: "mCom" },
  { label: "C.Com", key: "cCom" },
  { label: "S.Com", key: "sCom" },
  { label: "MT.Com", key: "mtCom" },
  { label: "T.Com", key: "tCom" },
  { label: "G. Total", key: "gTotal" },
  { label: "UP/Down Share", key: "upDownShare" },
  { label: "Balance", key: "balance" },
];

const AllReport: React.FC = () => {
  const userState = useAppSelector(selectUserData);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [optionuser, setOptionuser] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLedger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await betService.twoledger();
      const data = res.data?.data;
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading ledger:", err);
      setError("Unable to load ledger data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLedger(); }, [loadLedger]);

  const visibleEntries = useMemo(() => entries.filter((entry) => {
    if (entry.settled === true) return false;
    if (!startDate && !endDate) return true;
    if (!entry.createdAt) return false;
    const time = new Date(entry.createdAt).getTime();
    if (!Number.isFinite(time)) return false;
    const from = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const to = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Infinity;
    return time >= from && time <= to;
  }), [entries, startDate, endDate]);

  const ledgerData = useMemo<ReportRow[]>(() => {
    const grouped: Record<string, ReportRow> = {};
    visibleEntries.forEach((entry) => {
      const id = String(entry.ChildId || entry.ParentId || "");
      if (!id) return;
      if (!grouped[id]) {
        grouped[id] = {
          id, client: entry.username || id, cname: entry.cname || "", ss: amount(entry.superShare),
          match: 0, casino: 0, session: 0, matka: 0, totall: 0,
          mCom: 0, cCom: 0, sCom: 0, mtCom: 0, tCom: 0,
          gTotal: 0, upDownShare: 0, balance: 0,
        };
      }
      const row = grouped[id];
      const pnl = amount(entry.fammount);
      const commission = amount(entry.commissiondega);
      // Only explicit casinostatus=true is casino. Old records without it stay non-casino.
      if (entry.casinostatus === true) {
        row.casino += pnl;
        row.cCom += commission;
      } else if (entry.narration?.includes("Matka Bet")) {
        row.matka += pnl;
        row.mtCom += commission;
      } else if (entry.Fancy === true) {
        row.session += pnl;
        row.sCom += commission;
      } else {
        row.match += pnl;
        row.mCom += commission;
      }
    });
    return Object.keys(grouped).map((id) => {
      const row = grouped[id];
      row.totall = row.match + row.casino + row.session + row.matka;
      row.tCom = row.mCom + row.cCom + row.sCom + row.mtCom;
      row.gTotal = row.totall - row.tCom;
      row.upDownShare = (row.ss / 100) * row.gTotal;
      row.balance = row.gTotal - row.upDownShare;
      return row;
    });
  }, [visibleEntries]);

  const filteredLedgerData = useMemo(() => ledgerData.filter((row) =>
    (optionuser === "all" || row.id === optionuser) &&
    `${row.client} ${row.cname}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [ledgerData, optionuser, searchTerm]);

  const totals = useMemo(() => {
    const total = {} as Record<NumericKey, number>;
    columns.forEach(({ key }) => { total[key] = 0; });
    filteredLedgerData.forEach((row) => columns.forEach(({ key }) => { total[key] += row[key]; }));
    return total;
  }, [filteredLedgerData]);

  const isDl = userState?.user?.role === "dl";
  const displayValue = (row: ReportRow, key: NumericKey) =>
    isDl && (key === "upDownShare" || key === "balance") ? row.gTotal : row[key];

  return (
    <div style={{ zoom: 0.4 }}>
      <div className="relative"><h2 className="ledger-title text-xl">All Client Report</h2></div>
      <div className="control-group mt-2 container-fluid selectize-control single">
        <div className="row p-2 ng-scope">
          <div className="col-6 mt-1">
            <label className="small">Start Date</label>
            <input type="date" className="form-control start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-6 mt-1">
            <label className="small">End Date</label>
            <input type="date" className="form-control end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <select id="select-tools-sa" className="selectized selectize-input" value={optionuser} onChange={(e) => setOptionuser(e.target.value)}>
          <option value="all">All Clients</option>
          {ledgerData.map((row) => <option key={row.id} value={row.id}>{row.client}/{row.cname}</option>)}
        </select>
        <div className="row mt-2"><div className="col-sm-12 col-md-6" /><div className="col-sm-12 col-md-6">
          <div className="dataTables_filter"><label>Search: <input type="search" className="form-control form-control-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label></div>
        </div></div>
      </div>
      <div className="container-fluid mt-2"><div className="row"><div className="col-sm-12 overflow-auto h-screen">
        {error && <div className="text-danger">{error}</div>}
        <table className="table table-striped table-bordered ledger-list downlinepandl dataTable no-footer" style={{ width: "100%" }}>
          <thead className="small"><tr>
            <th className="navbar-bet99 text-dark pt-2 pb-2 small">Client</th>
            {columns.map(({ label, key }) => <th key={key} className="navbar-bet99 text-dark pt-2 pb-2 small">{label}</th>)}
            <th className="navbar-bet99 text-dark pt-2 pb-2 small">Details</th>
          </tr></thead>
          <tbody className="small">
            {filteredLedgerData.map((row, index) => <tr key={row.id} className={index % 2 === 0 ? "even" : "odd"}>
              <td>{row.client} ({row.cname})</td>
              {columns.map(({ key }) => <td key={key}><span className={key.endsWith("Com") ? "text-danger" : tone(displayValue(row, key))}>{moneyText(displayValue(row, key))}</span></td>)}
              <td><button type="button" onClick={() => setSelectedUser(row.client)} title="Details" className="btn-view-details btn btn-warning btn-sm small m-0"><i className="fas fa-window-maximize" /></button></td>
            </tr>)}
            {!loading && filteredLedgerData.length === 0 && <tr><td colSpan={columns.length + 2} className="text-center text-muted">No user found</td></tr>}
            {loading && <tr><td colSpan={columns.length + 2} className="text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div></div></div>
      <div className="card-body bg-light p-0" style={{ position: "fixed", zIndex: 50, bottom: 0, left: 0, width: "100%", overflow: "auto" }}>
        <table className="table table-striped table-bordered p-0 m-0"><thead className="small"><tr>
          <th className="navbar-bet99 text-dark pt-1 pb-1 small">TOTAL</th>
          {columns.map(({ key, label }) => <th key={key} className="navbar-bet99 text-dark pt-1 pb-1 small">{label}</th>)}
        </tr></thead><tbody><tr><td><strong>TOTAL</strong></td>
          {columns.map(({ key }) => {
            const value = isDl && (key === "upDownShare" || key === "balance") ? totals.gTotal : totals[key];
            return <td key={key}><span className={key.endsWith("Com") ? "text-danger" : tone(value)}>{moneyText(value)}</span></td>;
          })}
        </tr></tbody></table>
      </div>
      {selectedUser && <div className="absolute w-full container-fluidx top-0 left-0 bg-white z-50 p-3 border shadow-lg">
        <button type="button" onClick={() => setSelectedUser(null)} className="close" aria-label="Close"><span aria-hidden="true">×</span></button>
        <ReportModal data={selectedUser} />
      </div>}
    </div>
  );
};

export default AllReport;
