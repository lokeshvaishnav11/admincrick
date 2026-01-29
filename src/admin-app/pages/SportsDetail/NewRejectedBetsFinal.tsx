import React, { MouseEvent } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import { isMobile } from "react-device-detect";
import userService from "../../../services/user.service";
import { Color } from "antd/es/color-picker";
import { useParams } from "react-router-dom";

const NewRejectedBetsFinal = ({ hideHeader, matchId }: any) => {
  const [betHistory, setBetHistory] = React.useState([]);
  const {id} = useParams();

  React.useEffect(() => {
    const fetchBetHistory = async () => {
      try {
        const res = await userService.getUsercompletedbets22();
        const allBets = res.data.data;

        const filteredBets = allBets.filter(
            (bet: any) => bet.matchId == id && bet.status === "deleted"
          );
        //console.log(res, "res bet history");
        setBetHistory(filteredBets); // Or setBetHistory(res.data) depending on your API response
      } catch (e: any) {
        const error = e?.response?.data?.message || "Something went wrong";
        toast.error(error);
      }
    };

    fetchBetHistory();
  }, [id]);

  return (
    <>
      <h2 className="ledger-title">REJECTED / CANCELLED BETS </h2>
      <div className="container-fluid">
        <div className="container mt-4">
          <div className="table-responsive">
            <table
              className="table table-bordered table-hover table-sm table-striped"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <thead className="thead-dark">
                <tr>
                  <th>Clients</th>
                  <th>Market</th>
                  <th>Runs</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Result</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {betHistory?.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center">
                      No deleted bets found.
                    </td>
                  </tr>
                ) : (
                  betHistory?.map((bet: any, index: number) => (
                    <tr key={index}>
                      <td>{bet.parentNameStr || "-"}/{bet.userName || "-"}</td>
                      <td>{bet.bet_on || "-"}</td>
                      <td>{bet.selectionName || "-"}</td>
                      <td style={{ color: bet.isBack ? "green" : "red" }}>
                        {bet.isBack ? "Yes" : "No"}
                      </td>
                      
                      <td>{bet.stack ?? "-"}</td>
                     
                      <td>{bet.pnl ?? "-"}</td>

                      <td>
                        {moment
                          .utc(bet.betClickTime)
                          .format("MMMM Do, h:mm:ss A")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default NewRejectedBetsFinal;
