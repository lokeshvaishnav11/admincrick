import moment from "moment";
import React, { MouseEvent } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import accountService from "../../../services/account.service";
import { betDateFormat, dateFormat } from "../../../utils/helper";
import { isMobile } from "react-device-detect";
import mobileSubheader from "../_layout/elements/mobile-subheader";
import userService from "../../../services/user.service";
import CustomAutoComplete from "../../components/CustomAutoComplete";
import { AccoutStatement } from "../../../models/AccountStatement";
import betService from "../../../services/bet.service";
import { AxiosResponse } from "axios";
import ReactModal from "react-modal";
import BetListComponent from "../UnsetteleBetHistory/bet-list.component";
import { useAppSelector } from "../../../redux/hooks";
import { selectLoader } from "../../../redux/actions/common/commonSlice";

import "./CommissionTable.css";
import { useParams } from "react-router-dom";



const AccountStatementAdmin = () => {
  const loadingState = useAppSelector(selectLoader);
  const myuser = useParams().name;

  const [currentItems, setCurrentItems] = React.useState<any>([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [itemsPerPage] = React.useState<any>(50);

  const [isOpen, setIsOpen] = React.useState(false);
  const [betHistory, setBetHistory] = React.useState<any>({});
  const [selectedStmt, setSelectedStmt] = React.useState<AccoutStatement>(
    {} as AccoutStatement
  );

  const [openBalance, setOpenBalance] = React.useState(0);
  const [page, setPage] = React.useState(1);

  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: "",
    endDate: "",
    reportType: "All",
    userId: "",
  });

  // 🔥 FORMAT WITH PAGE OFFSET BALANCE FIX
  const dataformat = (response: any, baseBalance: number, startIndex: number) => {
    let closingbalance = baseBalance;

    return response.map((stmt: any, index: number) => {
      closingbalance = closingbalance + stmt.amount;

      return {
        _id: stmt._id,
        sr_no: startIndex + index + 1,
        date: moment(stmt.createdAt).format(dateFormat),
        credit: stmt.amount,
        debit: stmt.amount,
        closing: closingbalance.toFixed(2),
        narration: stmt.narration,
        type: stmt.type,
        stmt: stmt,
      };
    });
  };

  // 🔥 INITIAL DATE
  React.useEffect(() => {
    const filterObj = filterdata;
    filterObj.startDate = moment().subtract(70, "days").format("YYYY-MM-DD");
    filterObj.endDate = moment().format("YYYY-MM-DD");
    setfilterdata({ ...filterObj });
  }, []);

  // 🔥 MAIN API
const getAccountStmt = async (pageNumber: number) => {
  try {
    // 🔥 CURRENT PAGE
    const res = await accountService.getAccountList(pageNumber, filterdata);

    const items = res?.data?.data?.items || [];
    const opening = res?.data?.data?.openingBalance || 0;
    const total = res?.data?.data?.total || 0;

    let baseBalance = opening;

    // 🔥 FIX: LOOP THROUGH PREVIOUS PAGES
    if (pageNumber > 1) {
      let prevSum = 0;

      for (let i = 1; i < pageNumber; i++) {
        const prevRes = await accountService.getAccountList(i, filterdata);
        const prevItems = prevRes?.data?.data?.items || [];

        prevSum += prevItems.reduce(
          (acc: number, curr: any) => acc + curr.amount,
          0
        );
      }

      baseBalance = opening + prevSum;
    }

    setCurrentItems(
      dataformat(
        items,
        baseBalance,
        (pageNumber - 1) * itemsPerPage
      )
    );

    setOpenBalance(opening);
    setPage(pageNumber);
    setPageCount(Math.ceil(total / itemsPerPage));
  } catch {
    toast.error("error");
  }
};

  // 🔥 SUBMIT
  const submitAccountStatement = () => {
    getAccountStmt(1);
  };

  const handleSubmitform = (event: any) => {
    event.preventDefault();
    submitAccountStatement();
  };

  // 🔥 PAGINATION
  const handlePageClick = (event: any) => {
    const selectedPage = event.selected + 1;
    getAccountStmt(selectedPage);
  };

  const handleformchange = (event: any) => {
    const filterObj = filterdata;
    filterObj[event.target.name] = event.target.value;
    setfilterdata({ ...filterObj });
  };

  React.useEffect(() => {
    if (myuser) {
      setfilterdata({ ...filterdata, userId: myuser });
    }
  }, [myuser]);

  React.useEffect(() => {
    if (filterdata.userId) {
      submitAccountStatement();
    }
  }, [filterdata.userId]);

  // 🔥 BET MODAL (RESTORED)
  const handlePageClickBets = (event: any) => {
    getBetsData(selectedStmt, event.selected + 1);
  };

  React.useEffect(() => {
    if (isOpen) getBetsData(selectedStmt, 1);
  }, [selectedStmt]);

  const getBetsData = (stmt: AccoutStatement, pageNumber: number) => {
    const betIds: any = stmt?.allBets?.map(({ betId }: any) => betId);

    if (betIds && betIds.length > 0) {
      betService
        .getBetListByIds(betIds, pageNumber)
        .then((res: AxiosResponse) => {
          setIsOpen(true);
          setBetHistory(res.data.data);
        });
    }
  };

  const getBets = (
    e: MouseEvent<HTMLTableCellElement>,
    stmt: AccoutStatement
  ) => {
    e.preventDefault();
    setSelectedStmt(stmt);
    setIsOpen(true);
  };

  // 🔥 TABLE
  const getAcHtml = () => {
    return currentItems.map((stmt: any, index: number) => {
      return (
        <tr key={`${stmt._id}${index}`}>
          <td>{stmt.sr_no}</td>
          <td className="wnwrap">{stmt.date}</td>

          <td className="green">
            {stmt.credit >= 0 && stmt.credit.toFixed(2)}
          </td>

          <td className="red">
            {stmt.credit < 0 && stmt.credit.toFixed(2)}
          </td>

          <td className="green">{stmt.closing}</td>

          <td>{stmt.stmt.txnBy}</td>

          <td onClick={(e) => getBets(e, stmt.stmt)}>
            <span className={stmt.type == "pnl" ? "label-buttonccc" : ""}>
              {stmt.narration}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin("Account Statements")}

      <div className="container-fluid">
        <div className="card-body p15 bg-gray mb-20">
          <form onSubmit={handleSubmitform}>
            <div className="row row2">
              <div className="col-12 col-lg-2">
                <label>Type</label>
                <select
                  name="reportType"
                  onChange={handleformchange}
                  className="custom-select"
                >
                  <option value="ALL">All</option>
                  <option value="chip">Deposit/Withdraw</option>
                  <option value="game">Game Report</option>
                </select>
              </div>

              <div className="col-12 col-lg-1">
                <label>&nbsp;</label>
                <button type="submit" className="btn btn-primary btn-block">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="card-body">
          <table className="text-center" id="customers1">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Date</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>Balance</th>
                <th>From</th>
                <th>Remark</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>No Result Found</td>
                </tr>
              ) : (
                getAcHtml()
              )}
            </tbody>
          </table>

          {/* 🔥 PAGINATION BACK */}
          <ReactPaginate
            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousLabel={"Prev"}
          />
        </div>
      </div>

      {/* 🔥 BET MODAL BACK */}
      <ReactModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className={"col-md-12"}
        ariaHideApp={false}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5>Bets</h5>
            <button onClick={() => setIsOpen(false)} className="close">
              <i className="fa fa-times-circle"></i>
            </button>
          </div>
          <div className="modal-body">
            {!loadingState && (
              <BetListComponent
                bethistory={betHistory}
                handlePageClick={handlePageClickBets}
                page={page}
                isTrash={false}
              />
            )}
          </div>
        </div>
      </ReactModal>
    </>
  );
};
export default AccountStatementAdmin;
