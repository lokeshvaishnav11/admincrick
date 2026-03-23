import React, { useState } from "react";
import accountService from "../../../services/account.service";
import betService from "../../../services/bet.service";
import { round } from "lodash";

// ✅ DUMMY MATKA LIST

// ✅ DUMMY API
const betserver = {
  matkaResult: (item: any) => {
    //console.log("API HIT → betserver.matkaResult", item);
    return Promise.resolve({ success: true });
  },
};

export default function MatkaResultRollback() {
  const [date, setDate] = React.useState("");
  const [selectedMatchId, setSelectedMatchId] = React.useState("");
  const [result, setResult] = React.useState("");
  const [rows, setRows] = React.useState<any>([]);

  const [matkaList, setMatkaList] = React.useState<any>([]);

  React.useEffect(() => {
    const fetchMatkaList = async () => {
      try {
        const res = await accountService.matkagamelistRollBack();
        console.log(res?.data?.data.reverse().slice(0,12), "ffff");
        setMatkaList(res?.data?.data?.slice(0,12));
      } catch (err) {
        console.error("Matka list error:", err);
      }
    };

    fetchMatkaList();
  }, []);

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const selectedGame = matkaList.find(
      (m: any) => m.roundid === selectedMatchId
    );

    if (!selectedGame) {
      alert("Invalid round selected");
      return;
    }

    const payload = {
      roundid: selectedGame.roundid, // 👈 MOST IMPORTANT
      gamename: selectedGame.gamename,
      result,
    };

    //console.log(payload,"bv")

    try {
      const res = await betService.matkaresult(payload);

      // success ke baad hi UI update
      setRows((prev: any) => [...prev, payload]);
      setResult("");
    } catch (err) {
      console.error("Result submit error:", err);
      alert("Result submit failed");
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="container p-3">
      <h2
        className="ledger-title rounded mb-2 "
        style={{ background: "black", color: "white" }}
      >
        Matka Rollback Result
      </h2>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        {/* DATE */}
        {/* <div className="col-md-3">
          <label className="form-label fw-bold">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div> */}

        {/* MARKET */}
        <div className="col-md-3">
          <label className="form-label fw-bold">Market</label>
          <select
            className="form-select"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            required
          >
            <option value="">Select Market</option>

            {matkaList.map((item: any) => (
              <option key={item.roundid} value={item.roundid}>
                {item.roundid}
              </option>
            ))}
          </select>
        </div>

        {/* RESULT */}
        <div className="col-md-3">
          <label className="form-label fw-bold">Result</label>
          <input
            type="number"
            className="form-control mb-2"
            value={result}
            onChange={(e) => {
              if (e.target.value.length <= 2) {
                setResult(e.target.value);
              }
            }}
            placeholder="Enter Result"
            required
          />
        </div>

        {/* BUTTON */}
        <div className="col-md-3 d-flex mt-2 align-items-end">
          <button type="submit" className="btn btn-success w-100">
            Update
          </button>
        </div>
      </form>

      {/* ===== TABLE ===== */}
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="bg-primary text-white">
            <tr>
              <th>SR</th>
              <th>Game</th>
              <th>Result</th>
              <th>Round Id</th>
              <th>Rollback</th>
            </tr>
          </thead>
          <tbody>
            {matkaList.length > 0 ? (
              matkaList.map((row: any, idx: any) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.gamename}</td>
                  <td>{row.result}</td>
                  <td>{row.roundid}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        try {
                          await betService.matkaresultRollback(row.roundid);
                          alert("Rollback successful");
                        } catch (err) {
                          console.error("Rollback error:", err);
                          alert("Rollback failed");
                        } finally {
                          window.location.reload();
                        }
                      }}
                    >
                      Rollback
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No Result Added</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

