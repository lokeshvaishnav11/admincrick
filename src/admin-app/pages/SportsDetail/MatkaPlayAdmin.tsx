import React from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import authService from "../../../services/auth.service";
import { betPopup } from "../../../redux/actions/bet/betSlice";
import { RoleType } from "../../../models/User";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { IBetOn, IBetType } from "../../../models/IBet";
import { IUserBetStake } from "../../../models/IUserStake";
import accountService from "../../../services/account.service";

const MatkaPlayAdmin = () => {
  const { matchId } = useParams(); // 👈 URL se matchId

  //console.log(matchId ,"mamkff")

  const userState = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();

  // const [gameType, setGameType] = React.useState("");
  const [gameType, setGameType] = React.useState<"single" | "haraf">("single");
  const [matkaBets, setMatkaBets] = React.useState<any[]>([]);


  const [matkaList, setMatkaList] = React.useState<any>([]);
  console.log(matkaList, "makdk")

  const [book, setBook] = React.useState<{
    single: Record<string, number>;
    andar: Record<string, number>;
    bahar: Record<string, number>;
  }>({
    single: {},
    andar: {},
    bahar: {},
  });



  React.useEffect(() => {
    const fetchMatkaList = async () => {
      try {
        const res = await accountService.matkagamelist();
        //console.log(res?.data?.data, "ffff");
        setMatkaList(res?.data?.data);
      } catch (err) {
        console.error("Matka list error:", err);
      }
    };

    fetchMatkaList();
  }, [matchId, userState]);

  const match = matkaList?.find((item: any) => item?.roundid == matchId);


  React.useEffect(() => {
    const fetchMatkaBets = async () => {
      try {
        if (!matchId) return;

        const res = await accountService.marketmatkaa();

        const allBets = res?.data?.data?.bets || [];

        // ✅ sirf usi roundid ki bets
        const filteredBets = allBets.filter(
          (bet: any) => String(bet.roundid) == String(matchId)
        );

        //console.log(filteredBets,"ffffff")

        setMatkaBets(filteredBets);
      } catch (error) {
        console.error("Market matka bets error:", error);
      }
    };



    fetchMatkaBets();
  }, [matchId, userState]);


  React.useEffect(() => {
    const fetchBook = async () => {
      try {
        if (!matchId) return;

        const res = await accountService.bookmarketmatkaa(matchId);

        const bookData = res?.data?.data?.book;

        if (bookData) {
          setBook({
            single: bookData.single || {},
            andar: bookData.andar || {},
            bahar: bookData.bahar || {},
          });
        }
      } catch (error) {
        console.error("Book matka error:", error);
      }
    };

    fetchBook();
  }, [matchId, userState]);


  // ✅ matching item nikaalo


  //   if (!match) {
  //     return <div className="text-center mt-3">Match not found</div>;
  //   }

  const renderPL = (value: number | undefined) => {
    if (!value || value === 0) {
      return <span className="text-dark">0</span>;
    }

    return (
      <span style={{ color: value < 0 ? "red" : "green", fontWeight: "bold" }}>
        {value}
      </span>
    );
  };


  const singlePattiNumbers = [
    ...Array.from({ length: 99 }, (_, i) => String(i + 1).padStart(2, "0")),
    "00",
  ];

  const harafNumbers = Array.from({ length: 10 }, (_, i) => i);

  const usid: any = userState!.user!._id;

  const matkastake: IUserBetStake[] = [
    {
      userId: usid,
      name1: "5",
      value1: 5,

      name2: "10",
      value2: 10,

      name3: "25",
      value3: 25,

      name4: "50",
      value4: 50,

      name5: "75",
      value5: 75,

      name6: "100",
      value6: 100,

      name7: "150",
      value7: 150,

      name8: "200",
      value8: 200,

      name9: "300",
      value9: 300,

      name10: "400",
      value10: 400,

      name11: "500",
      value11: 500,

      name12: "1K",
      value12: 1000,

      name13: "2K",
      value13: 2000,
    },
  ];

  //console.log(matkastake, "makrkk");

  const openTime = match?.opentime
    ? moment()
      .tz("Asia/Kolkata")
      .hour(match.opentime.hour)
      .minute(match.opentime.minute)
      .second(0)
      .format("DD-MM-YYYY hh:mm A")
    : "--";

  const closeTime = match?.closetime
    ? moment()
      .tz("Asia/Kolkata")
      .add(match.gamename === "Disawar" ? 1 : 0, "day")
      .hour(match.closetime.hour)
      .minute(match.closetime.minute)
      .second(0)
      .format("DD-MM-YYYY hh:mm A")
    : "--";


  return (
    <div className="container w-100 p-0">
      <div className="card single-match text-center my-2">
        <a>
          <h5
            className="ng-binding"
            style={{ backgroundColor: "#FFB200", color: "white" }}
          >
            {/* {match.name}-{moment().format("DD-MM-YYYY")} */}
            {match?.roundid}
          </h5>

          {/* <p
            className="ng-binding mt-1 mb-1"
            style={{ fontSize: "15px", fontWeight: "bold" }}
          >
            {moment().hour(9).minute(0).second(0).format("DD-MM-YYYY hh:mm A")}
          </p> */}
          <p className="mb-1 pt-1">
            <b>Open:</b> {openTime}
          </p>

          <p className="mb-1">
            <b>Close:</b> {closeTime}
          </p>
        </a>
      </div>

      {/* <div className="col-md-12 d-flex justify-content-center mb-2 mt-2">
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="select-satta-gametype"
        >
          <option value="">Select Game Type</option>
          <option value="single">Single Patti</option>
          <option value="haraf">Haraf Andar Bahar</option>
        </select>
      </div> */}

      <div className="col-md-12 d-flex justify-content-center mb-2 mt-2">
        <div className="satta-tabs">
          <button
            className={`satta-tab ${gameType === "single" ? "active" : ""}`}
            onClick={() => setGameType("single")}
          >
            Single Patti
          </button>

          <button
            className={`satta-tab ${gameType === "haraf" ? "active" : ""}`}
            onClick={() => setGameType("haraf")}
          >
            Andar Bahar
          </button>
        </div>
      </div>

      <div>
        {gameType === "single" && (
          <>
            <div className="row">
              {singlePattiNumbers.map((num) => (
                <div key={num} className="col-4 col-md-3 mb-2">
                  <button className="btn btn-info w-100">{num}</button>
                  {/* <span className="btn w-100">0</span> */}
                  <span className="btn w-100">
                    {renderPL(book.single[num])}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {gameType === "haraf" && (
          <>
            {/* ANDAR */}
            <h5 className="col-12 mb-2 harup-satta-text">Haraf Andar</h5>
            <div className="row">
              {harafNumbers.map((num) => (
                <div key={`andar-${num}`} className="col-4 col-md-1 mb-2">
                  <button className="btn btn-info w-100">{num}</button>
                  <span className="btn w-100">
                    {renderPL(book.andar[num])}
                  </span>
                </div>
              ))}
            </div>

            {/* BAHAR */}
            <h5 className="col-12 mb-2 harup-satta-text mt-3">Haraf Bahar</h5>
            <div className="row">
              {harafNumbers.map((num) => (
                <div key={`bahar-${num}`} className="col-4 col-md-1 mb-2">
                  <button className="btn btn-info w-100">{num}</button>
                  <span className="btn w-100">
                    {renderPL(book.bahar[num])}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <h6 className="p-2 w-100 m-0 bg-info text-white text-center">
        Matka Bets
      </h6>

      <div
        className="table-responsive-new"
        style={{ height: "200px", overflowY: "scroll" }}
      >
        <table className="table coupon-table scorall mybet">
          <thead>
            <tr style={{ background: "#76d68f" }}>
              <th className="p-2"> Sr. </th>
              {userState.user.role !== RoleType.user && (
                <th className="p-2">Username</th>
              )}
              <th className="text-center p-2"> Narration</th>
              <th className="text-center p-2"> Rate</th>
              <th className="text-center p-2"> Amount</th>
              <th className="text-center p-2"> Selection</th>
              <th className="text-center p-2"> Type</th>

              {/* {!isMobile && <th style={{background:"#76d68f"}}> Place Date</th>} */}
              {/* {!isMobile && <th style={{background:"#76d68f"}}> Match Date</th>} */}
              {/* <th className='text-center'> Dec</th> */}
              <th className="text-center p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {matkaBets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No bets found for this round
                </td>
              </tr>
            ) : (
              matkaBets.map((bet: any, index: number) => (
                <tr
                  key={bet._id}
                  className={
                    Number(bet.profitLoss?.$numberDecimal || 0) < 0
                      ? "bg-danger text-white"
                      : "bg-success"
                  }
                >
                  <td className="text-center">{index + 1}</td>

                  {userState.user.role !== RoleType.user && (
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                      {bet?.parentData
                        ?.slice(
                          bet?.parentData.indexOf(userState.user.username) + 1
                        )
                        .join("/")}
                      /{bet?.username}
                    </td>
                  )}





                  <td className="text-center text-nowrap">{bet.roundid}</td>

                  <td className="text-center text-nowrap">{bet.odds}</td>

                  <td className="text-center text-nowrap">{bet.betamount}</td>

                  <td className="text-center text-nowrap">{bet.selectionId}</td>

                  <td className="text-center text-nowrap">{bet.bettype}</td>

                  <td className="text-center text-nowrap">
                    {
                      moment(bet.createdAt)
                        .tz("Asia/Kolkata")
                        .format("DD/MM/YYYY hh:mm:ss A")
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatkaPlayAdmin;
