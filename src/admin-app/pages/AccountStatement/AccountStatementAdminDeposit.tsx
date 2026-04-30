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

// 🔥 ONLY IMPORTANT CHANGES MARKED WITH 🔥

const AccountStatementAdminDeposit = () => {
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
    reportType: "chip",
    userId: "",
  });

  // 🔥 FORMAT FUNCTION (UPDATED)
  const dataformat = (
    response: any,
    baseBalance: number,
    startIndex: number
  ) => {
    let closingbalance = baseBalance;

    return response.map((stmt: any, index: number) => {
      closingbalance = closingbalance + stmt.amount;

      return {
        _id: stmt._id,
        sr_no: startIndex + index + 1,
        date: moment(stmt.createdAt).format(betDateFormat),
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
    const filterObj = { ...filterdata };
    filterObj.startDate = moment().subtract(70, "days").format("YYYY-MM-DD");
    filterObj.endDate = moment().format("YYYY-MM-DD");
    setfilterdata(filterObj);
  }, []);

  // 🔥 MAIN API WITH CORRECT PAGINATION
  const getAccountStmt = async (pageNumber: number) => {
    try {
      const res = await accountService.getAccountList(pageNumber, filterdata);

      const items = res?.data?.data?.items || [];
      const opening = res?.data?.data?.openingBalance || 0;
      const total = res?.data?.data?.total || 0;

      let baseBalance = opening;

      // 🔥 PREVIOUS PAGE SUM (IMPORTANT FIX)
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

  // 🔥 PAGINATION CLICK
  const handlePageClick = (event: any) => {
    const selectedPage = event.selected + 1;
    getAccountStmt(selectedPage);
  };

  const handleformchange = (event: any) => {
    const filterObj = { ...filterdata };
    filterObj[event.target.name] = event.target.value;
    setfilterdata(filterObj);
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

  // 🔥 BET MODAL
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

  // 🔥 TABLE RENDER
  const getAcHtml = () => {
    return currentItems.map((stmt: any, index: number) => {
      return (
        <tr key={`${stmt._id}${index}`}>
          <td>{stmt.sr_no}</td>
          <td>{stmt.date}</td>

          <td>{stmt.credit >= 0 && stmt.credit.toFixed(2)}</td>
          <td>{stmt.credit < 0 && stmt.credit.toFixed(2)}</td>

          <td>{stmt.closing}</td>
          <td>{stmt.stmt.txnBy}</td>

          <td onClick={(e) => getBets(e, stmt.stmt)}>
            {stmt.narration}
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      <div className="container-fluid">
        <div className="card-body">
          <table className="text-center">
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

          {/* 🔥 PAGINATION */}
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

      {/* 🔥 MODAL */}
      <ReactModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <div>
          {!loadingState && (
            <BetListComponent
              bethistory={betHistory}
              handlePageClick={handlePageClickBets}
              page={page}
              isTrash={false}
            />
          )}
        </div>
      </ReactModal>
    </>
  );
};
export default AccountStatementAdminDeposit;
