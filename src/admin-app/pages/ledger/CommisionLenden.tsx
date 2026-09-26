import React, { useState } from "react";
import "./ClientLedger.css";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

interface CommissionRow {
  name: string;
  cname: string;
  milaCasinoComm: number;
  milaSportsComm: number;
  milaMatkaComm: number;
  milaTotalComm: number;
  denaCasinoComm: number;
  denaSportsComm: number;
  denaMatkaComm: number;
  denaTotalComm: number;
  date?: string;
}

const CommisionLenden: React.FC = () => {
  const navigate = useNavigate();

  const [commissionData, setCommissionData] = useState<CommissionRow[]>([]);
  const [allEntries, setAllEntries] = useState<any[][]>([]);

  const [optionuser, setOptionuser] = React.useState<string>("all");

  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [zoom, setZoom] = React.useState(1);

  React.useEffect(() => {
    betService.oneledger().then((res: AxiosResponse<any>) => {
      const data = res.data.data;

      const processed = processCommissionTable(data);

      setCommissionData(processed);
      setAllEntries(data);
    });
  }, []);

  const processCommissionTable = (
    data: any[][]
  ): CommissionRow[] => {
    const milaCasinoMap: Record<string, number> = {};
    const milaSportsMap: Record<string, number> = {};
    const milaMatkaMap: Record<string, number> = {};

    const denaCasinoMap: Record<string, number> = {};
    const denaSportsMap: Record<string, number> = {};
    const denaMatkaMap: Record<string, number> = {};

    const usernameMap: Record<string, string> = {};
    const cnameMap: Record<string, string> = {};

    const sourceArray =
      data[0]?.length > 0 ? data[0] : data[0] || [];

    sourceArray.forEach((entry: any) => {
      const childId = entry.ChildId;

      const isFancy = entry.Fancy === true;

      const isMatka =
        entry?.narration?.includes("Matka Bet");

      const mila = entry.iscomSet
        ? 0
        : entry.commissionlega || 0;

      const dena = entry.iscomSet
        ? 0
        : entry.commissiondega || 0;

      // USERNAME
      if (!usernameMap[childId]) {
        const match = data[0]?.find(
          (ref: any) =>
            ref.ParentId === childId
        );

        usernameMap[childId] =
          match?.username ||
          entry.username ||
          childId;
      }

      // CNAME
      if (!cnameMap[childId]) {
        const match = data[0]?.find(
          (ref: any) =>
            ref.ParentId === childId
        );

        cnameMap[childId] =
          match?.cname ||
          entry.cname ||
          childId;
      }

      // INITIALIZE MILA
      if (!milaCasinoMap[childId])
        milaCasinoMap[childId] = 0;

      if (!milaSportsMap[childId])
        milaSportsMap[childId] = 0;

      if (!milaMatkaMap[childId])
        milaMatkaMap[childId] = 0;

      // INITIALIZE DENA
      if (!denaCasinoMap[childId])
        denaCasinoMap[childId] = 0;

      if (!denaSportsMap[childId])
        denaSportsMap[childId] = 0;

      if (!denaMatkaMap[childId])
        denaMatkaMap[childId] = 0;

      // MATKA
      if (isMatka) {
        milaMatkaMap[childId] += mila;
        denaMatkaMap[childId] += dena;
      }

      // SPORTS / FANCY
      else if (isFancy) {
        milaSportsMap[childId] += mila;
        denaSportsMap[childId] += dena;
      }

      // CASINO
      else {
        milaCasinoMap[childId] += mila;
        denaCasinoMap[childId] += dena;
      }
    });

    const allChildIds = new Set([
      ...Object.keys(milaCasinoMap),
      ...Object.keys(milaSportsMap),
      ...Object.keys(denaCasinoMap),
      ...Object.keys(denaSportsMap),
    ]);

    let totalMilaCasino = 0;
    let totalMilaSports = 0;
    let totalMilaMatka = 0;

    let totalDenaCasino = 0;
    let totalDenaSports = 0;
    let totalDenaMatka = 0;

    const result: CommissionRow[] = [];

    allChildIds.forEach((id) => {
      const milaCasino =
        milaCasinoMap[id] || 0;

      const milaSports =
        milaSportsMap[id] || 0;

      const milaMatka =
        milaMatkaMap[id] || 0;

      const denaCasino =
        denaCasinoMap[id] || 0;

      const denaSports =
        denaSportsMap[id] || 0;

      const denaMatka =
        denaMatkaMap[id] || 0;

      totalMilaCasino += milaCasino;
      totalMilaSports += milaSports;
      totalMilaMatka += milaMatka;

      totalDenaCasino += denaCasino;
      totalDenaSports += denaSports;
      totalDenaMatka += denaMatka;

      result.push({
        name: usernameMap[id] || id,
        cname: cnameMap[id] || id,

        milaCasinoComm: milaCasino,
        milaSportsComm: milaSports,
        milaMatkaComm: milaMatka,

        milaTotalComm:
          milaCasino +
          milaSports +
          milaMatka,

        denaCasinoComm: denaCasino,
        denaSportsComm: denaSports,
        denaMatkaComm: denaMatka,

        denaTotalComm:
          denaCasino +
          denaSports +
          denaMatka,
      });
    });

    // TOTAL ROW
    result.push({
      name: "TOTAL",
      cname: "All",

      milaCasinoComm: totalMilaCasino,
      milaSportsComm: totalMilaSports,
      milaMatkaComm: totalMilaMatka,

      milaTotalComm:
        totalMilaCasino +
        totalMilaSports +
        totalMilaMatka,

      denaCasinoComm: totalDenaCasino,
      denaSportsComm: totalDenaSports,
      denaMatkaComm: totalDenaMatka,

      denaTotalComm:
        totalDenaCasino +
        totalDenaSports +
        totalDenaMatka,
    });

    console.log(result, "ressss");

    return result;
  };

  // ============================
  // DATE FILTER
  // ============================

  const handleDateFilter = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);

    const end = new Date(endDate);

    end.setHours(
      23,
      59,
      59,
      999
    );

    const filteredData =
      allEntries[0]?.filter(
        (entry: any) => {
          const entryDate =
            new Date(
              entry.createdAt
            );

          return (
            entryDate >= start &&
            entryDate <= end
          );
        }
      ) || [];

    const updatedCommissionData =
      processCommissionTable([
        filteredData,
      ]);

    setCommissionData(
      updatedCommissionData
    );
  };

  // ============================
  // PARTICULAR USER DETAILS
  // ============================

  const renderUserDetails = (
    childId: string
  ) => {
    const sourceArray =
      allEntries[1]?.length > 0
        ? allEntries[0]
        : allEntries[0] || [];

    const filtered =
      sourceArray.filter(
        (item: any) =>
          item.username === childId
      );

    let totalMilaCasino = 0;
    let totalMilaSports = 0;
    let totalMilaMatka = 0;

    let totalDenaCasino = 0;
    let totalDenaSports = 0;
    let totalDenaMatka = 0;

    const rows = filtered.map(
      (
        item: any,
        index: number
      ) => {
        const isFancy =
          item.Fancy === true;

        const isMatka =
          item?.narration?.includes(
            "Matka Bet"
          );

        const mila =
          item.commissionlega || 0;

        const dena =
          item.commissiondega || 0;

        if (isMatka) {
          totalMilaMatka += mila;
          totalDenaMatka += dena;
        } else if (isFancy) {
          totalMilaSports += mila;
          totalDenaSports += dena;
        } else {
          totalMilaCasino += mila;
          totalDenaCasino += dena;
        }

        return (
          <tr key={index}>
            <td>
              {new Date(
                item.createdAt
              ).toLocaleString()}
            </td>

            <td>
              {item.narration ||
                "N/A"}
            </td>

            <td>
              {!isFancy
                ? mila.toFixed(2)
                : "-"}
            </td>

            <td>
              {isFancy
                ? mila.toFixed(2)
                : "-"}
            </td>

            <td>
              {isMatka
                ? mila.toFixed(2)
                : "-"}
            </td>

            <td>
              {!isFancy
                ? dena.toFixed(2)
                : "-"}
            </td>

            <td>
              {isFancy
                ? dena.toFixed(2)
                : "-"}
            </td>

            <td>
              {isMatka
                ? dena.toFixed(2)
                : "-"}
            </td>
          </tr>
        );
      }
    );

    const totalRow = (
      <tr key="total">
        <td colSpan={2}>
          <strong>
            TOTAL
          </strong>
        </td>

        <td>
          {totalMilaCasino.toFixed(
            2
          )}
        </td>

        <td>
          {totalMilaSports.toFixed(
            2
          )}
        </td>

        <td>
          {totalMilaMatka.toFixed(
            2
          )}
        </td>

        <td>
          {totalDenaCasino.toFixed(
            2
          )}
        </td>

        <td>
          {totalDenaSports.toFixed(
            2
          )}
        </td>

        <td>
          {totalDenaMatka.toFixed(
            2
          )}
        </td>
      </tr>
    );

    return [
      ...rows,
      totalRow,
    ];
  };

  // ============================
  // RESET / SETTLED
  // ============================

  const settled = async (
    name: string
  ) => {
    try {
      const res =
        await betService.comreset({
          name,
        });

      if (res.data.status) {
        window.location.reload();
      }
    } catch (error) {
      console.error(
        "Reset failed:",
        error
      );
    }
  };

  // ============================
  // JSX
  // ============================

  return (
    <div style={{ zoom }}>

      {/* ============================= */}
      {/* ZOOM CONTROLS */}
      {/* ============================= */}




      {/* ============================= */}
      {/* HEADER + HISTORY BUTTON */}
      {/* ============================= */}

      <div
        className="bg-full"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          paddingRight: "12px",
        }}
      >
        <span>
          Commision Len Den
        </span>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/commision-len-den-2"
            )
          }
          style={{
            background:
              "#ffc107",
            color: "#111",
            border: "none",
            borderRadius:
              "6px",
            padding:
              "6px 14px",
            fontSize:
              "13px",
            fontWeight: 700,
            cursor:
              "pointer",
          }}
        >
        Reset  History
        </button>
      </div>

      {/* ============================= */}
      {/* DATE FILTER */}
      {/* ============================= */}

      <div className="row p-4">
        <div className="col-6 mt-1">
          <label className="small">
            Start Date
          </label>

          <input
            type="date"
            className="form-control start_date"
            name="start_date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />
        </div>

        <div className="col-6 mt-1">
          <label className="small">
            End Date
          </label>

          <input
            type="date"
            className="form-control end_date"
            name="end_date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />
        </div>

        <button
          className="btn btn-primary mt-2 mx-3"
          onClick={
            handleDateFilter
          }
        >
          Submit
        </button>
      </div>

      {/* ============================= */}
      {/* USER SELECT */}
      {/* ============================= */}

      <select
        id="select-tools-sa"
        className="selectized mx-4 selectize-input ng-valid ng-not-empty ng-dirty ng-valid-parse ng-touched"
        value={optionuser}
        onChange={(e) =>
          setOptionuser(
            e.target.value
          )
        }
      >
        <option value="all">
          All Clients
        </option>

        {commissionData?.map(
          (
            row: any,
            index
          ) => (
            <option
              key={index}
              value={row.client}
            >
              {row.name}
            </option>
          )
        )}
      </select>

      {/* ============================= */}
      {/* TABLE */}
      {/* ============================= */}

      <div className="table-container">
        <div className="table-wrapper">
          <table className="commission-table">

            {/* ======================== */}
            {/* TABLE HEADER */}
            {/* ======================== */}

            <thead>
              {optionuser ===
              "all" ? (
                <>
                  <tr>
                    <th
                      style={{
                        borderRightColor:
                          "black",
                        borderRightWidth:
                          "20px",
                      }}
                      colSpan={5}
                    >
                      MILA HAI
                    </th>

                    <th colSpan={5}>
                      DENA HAI
                    </th>
                  </tr>

                  <tr>
                    <th>
                      Name
                    </th>

                    <th>
                      M Comm
                    </th>

                    <th>
                      S Comm
                    </th>

                    <th>
                      Mat Comm
                    </th>

                    <th
                      style={{
                        borderRightColor:
                          "black",
                        borderRightWidth:
                          "20px",
                      }}
                    >
                      Total Comm
                    </th>

                    <th>
                      M Comm
                    </th>

                    <th>
                      S Comm
                    </th>

                    <th>
                      Mat Comm
                    </th>

                    <th>
                      Total Comm
                    </th>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Narration
                    </th>

                    <th>
                      M Mila
                    </th>

                    <th>
                      S Mila
                    </th>

                    <th>
                      Mat Mila
                    </th>

                    <th>
                      M Dena
                    </th>

                    <th>
                      S Dena
                    </th>

                    <th>
                      Mat Dena
                    </th>
                  </tr>
                </>
              )}
            </thead>

            {/* ======================== */}
            {/* TABLE BODY */}
            {/* ======================== */}

            <tbody>
              {optionuser ===
              "all"
                ? commissionData
                    ?.filter(
                      (
                        row,
                        index,
                        self
                      ) =>
                        index ===
                        self.findIndex(
                          (r) =>
                            r.name ===
                            row.name
                        )
                    )
                    ?.map(
                      (row) =>
                        1 > 0 && (
                          <tr
                            key={
                              row.name
                            }
                          >
                            {/* USER */}
                            <td>
                              {
                                row.name
                              }

                              {`(${row.cname})`}

                              <button
                                onClick={() =>
                                  settled(
                                    row.name
                                  )
                                }
                                className="bg-yellow-400 mt-1.5 px-2 py-1.5 rounded-md"
                              >
                                Reset
                              </button>
                            </td>

                            {/* MILA CASINO */}
                            <td>
                              {row.milaCasinoComm.toFixed(
                                2
                              )}
                            </td>

                            {/* MILA SPORTS */}
                            <td>
                              {row.milaSportsComm.toFixed(
                                2
                              )}
                            </td>

                            {/* MILA MATKA */}
                            <td>
                              {row.milaMatkaComm.toFixed(
                                2
                              )}
                            </td>

                            {/* MILA TOTAL */}
                            <td
                              style={{
                                borderRightColor:
                                  "black",
                                borderRightWidth:
                                  "20px",
                              }}
                            >
                              {row.milaTotalComm.toFixed(
                                2
                              )}
                            </td>

                            {/* DENA CASINO */}
                            <td>
                              {row.denaCasinoComm.toFixed(
                                2
                              )}
                            </td>

                            {/* DENA SPORTS */}
                            <td>
                              {row.denaSportsComm.toFixed(
                                2
                              )}
                            </td>

                            {/* DENA MATKA */}
                            <td>
                              {row.denaMatkaComm.toFixed(
                                2
                              )}
                            </td>

                            {/* DENA TOTAL */}
                            <td>
                              {row.denaTotalComm.toFixed(
                                2
                              )}
                            </td>
                          </tr>
                        )
                    )
                : renderUserDetails(
                    optionuser
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommisionLenden;