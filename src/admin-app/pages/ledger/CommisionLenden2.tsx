import React, { useEffect, useMemo, useState } from "react";
import "./ClientLedger.css";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";

type Kind = "match" | "casino" | "session" | "matka";
type Totals = Record<Kind, number>;
interface LedgerEntry {
  ChildId?: string;
  ParentId?: string;
  username?: string;
  cname?: string;
  narration?: string;
  createdAt?: string;
  Fancy?: boolean;
  casinostatus?: boolean;
  iscomSet?: boolean;
  commissionlega?: number;
  commissiondega?: number;
}
interface CommissionRow {
  id: string;
  name: string;
  cname: string;
  mila: Totals;
  dena: Totals;
}
const kinds: Kind[] = ["match", "casino", "session", "matka"];
const blank = (): Totals => ({ match: 0, casino: 0, session: 0, matka: 0 });
const num = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};
const classify = (entry: LedgerEntry): Kind => {
  if (entry.casinostatus === true) return "casino";
  if (entry.narration?.includes("Matka Bet")) return "matka";
  if (entry.Fancy === true) return "session";
  return "match";
};
const sum = (values: Totals) => kinds.reduce((total, key) => total + values[key], 0);
const amount = (value: number) => value.toFixed(2);

const CommisionLenden2: React.FC = () => {
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [optionuser, setOptionuser] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedDates, setAppliedDates] = useState<{ start: string; end: string } | null>(null);
  const [zoom] = useState(1);

  useEffect(() => {
    betService.oneledger()
      .then((res: AxiosResponse<any>) => {
        const data = res.data?.data;
        setAllEntries(Array.isArray(data?.[0]) ? data[0] : []);
      })
      .catch((error: unknown) => console.error("Commission history load failed:", error));
  }, []);

  // This page is the settled commission HISTORY: don't mix in unsettled entries.
  const settledEntries = useMemo(
    () => allEntries.filter((entry) => entry.iscomSet === true),
    [allEntries]
  );

  const visibleEntries = useMemo(() => {
    if (!appliedDates) return settledEntries;
    const from = new Date(`${appliedDates.start}T00:00:00`);
    const to = new Date(`${appliedDates.end}T23:59:59.999`);
    return settledEntries.filter((entry) => {
      if (!entry.createdAt) return false;
      const date = new Date(entry.createdAt);
      return date >= from && date <= to;
    });
  }, [settledEntries, appliedDates]);

  const rows = useMemo<CommissionRow[]>(() => {
    const map = new Map<string, CommissionRow>();
    for (const entry of visibleEntries) {
      const id = String(entry.ChildId ?? entry.username ?? "");
      if (!id) continue;
      if (!map.has(id)) {
        const ref = allEntries.find((item) => String(item.ParentId ?? "") === id);
        map.set(id, {
          id,
          name: ref?.username || entry.username || id,
          cname: ref?.cname || entry.cname || id,
          mila: blank(),
          dena: blank(),
        });
      }
      const row = map.get(id)!;
      const kind = classify(entry);
      row.mila[kind] += num(entry.commissionlega);
      row.dena[kind] += num(entry.commissiondega);
    }
   return Array.from(map.values());
  }, [visibleEntries, allEntries]);

  const grand = useMemo(() => {
    const mila = blank();
    const dena = blank();
    for (const row of rows) {
      for (const kind of kinds) {
        mila[kind] += row.mila[kind];
        dena[kind] += row.dena[kind];
      }
    }
    return { mila, dena };
  }, [rows]);

  const selected = rows.find((row) => row.id === optionuser);
  const userEntries = visibleEntries.filter(
    (entry) => String(entry.ChildId ?? entry.username ?? "") === optionuser
  );
  const detailTotals = useMemo(() => {
    const mila = blank();
    const dena = blank();
    for (const entry of userEntries) {
      const kind = classify(entry);
      mila[kind] += num(entry.commissionlega);
      dena[kind] += num(entry.commissiondega);
    }
    return { mila, dena };
  }, [userEntries]);

  const handleDateFilter = () => {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      window.alert("Start Date, End Date se aage nahi honi chahiye.");
      return;
    }
    setAppliedDates({ start: startDate, end: endDate });
  };

  return (
    <div style={{ zoom }}>
      <div className="bg-full">Commision Len Den History</div>
      <div className="row p-4">
        <div className="col-6 mt-1">
          <label className="small">Start Date</label>
          <input type="date" className="form-control start_date" name="start_date"
            value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="col-6 mt-1">
          <label className="small">End Date</label>
          <input type="date" className="form-control end_date" name="end_date"
            value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary mt-2 mx-3" onClick={handleDateFilter}>Submit</button>
      </div>
      <select id="select-tools-sa"
        className="selectized mx-4 selectize-input ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched"
        value={optionuser} onChange={(e) => setOptionuser(e.target.value)}>
        <option value="all">All Clients</option>
        {rows.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select>
      <div className="table-container">
        <div className="table-wrapper">
          <table className="commission-table">
            <thead>
              {optionuser === "all" ? (
                <>
                  <tr>
                    <th colSpan={6} style={{ borderRightColor: "black", borderRightWidth: "20px" }}>MILA HAI</th>
                    <th colSpan={5}>DENA HAI</th>
                  </tr>
                  <tr>
                    <th>Name</th><th>M Comm</th><th>Casino Comm</th><th>S Comm</th><th>Mat Comm</th>
                    <th style={{ borderRightColor: "black", borderRightWidth: "20px" }}>Total Comm</th>
                    <th>M Comm</th><th>Casino Comm</th><th>S Comm</th><th>Mat Comm</th><th>Total Comm</th>
                  </tr>
                </>
              ) : (
                <tr>
                  <th>Date</th><th>Narration</th>
                  <th>M Mila</th><th>Casino Mila</th><th>S Mila</th><th>Mat Mila</th>
                  <th>M Dena</th><th>Casino Dena</th><th>S Dena</th><th>Mat Dena</th>
                </tr>
              )}
            </thead>
            <tbody>
              {optionuser === "all" ? (
                <>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name} ({row.cname})</td>
                      {kinds.map((kind) => <td key={`m-${kind}`}>{amount(row.mila[kind])}</td>)}
                      <td style={{ borderRightColor: "black", borderRightWidth: "20px" }}>{amount(sum(row.mila))}</td>
                      {kinds.map((kind) => <td key={`d-${kind}`}>{amount(row.dena[kind])}</td>)}
                      <td>{amount(sum(row.dena))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>TOTAL</strong></td>
                    {kinds.map((kind) => <td key={`tm-${kind}`}>{amount(grand.mila[kind])}</td>)}
                    <td style={{ borderRightColor: "black", borderRightWidth: "20px" }}>{amount(sum(grand.mila))}</td>
                    {kinds.map((kind) => <td key={`td-${kind}`}>{amount(grand.dena[kind])}</td>)}
                    <td>{amount(sum(grand.dena))}</td>
                  </tr>
                </>
              ) : (
                <>
                  {userEntries.map((entry, index) => {
                    const kind = classify(entry);
                    const mila = num(entry.commissionlega);
                    const dena = num(entry.commissiondega);
                    return (
                      <tr key={index}>
                        <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "-"}</td>
                        <td>{entry.narration || "N/A"}</td>
                        {kinds.map((key) => <td key={`m-${key}`}>{kind === key ? amount(mila) : "-"}</td>)}
                        {kinds.map((key) => <td key={`d-${key}`}>{kind === key ? amount(dena) : "-"}</td>)}
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={2}><strong>TOTAL{selected ? ` - ${selected.name}` : ""}</strong></td>
                    {kinds.map((kind) => <td key={`tm-${kind}`}>{amount(detailTotals.mila[kind])}</td>)}
                    {kinds.map((kind) => <td key={`td-${kind}`}>{amount(detailTotals.dena[kind])}</td>)}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommisionLenden2;
