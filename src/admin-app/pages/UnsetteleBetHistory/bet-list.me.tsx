import moment from 'moment'
import React, { useState } from 'react'
import ReactPaginate from 'react-paginate'
import IBet from '../../../models/IBet'
import User, { RoleType } from '../../../models/User'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { useAppSelector } from '../../../redux/hooks'
import { CONSTANTS } from '../../../utils/constants'
import { betDateFormat } from '../../../utils/helper'
import ReactModal from "react-modal"
import betService from "../../../services/bet.service" // 🔥 make sure this exists

interface BetListProps {
  bethistory: any
  page: number
  onTrash?: (e: any, bet: IBet) => void
  handlePageClick: (event: any) => void
  isTrash?: boolean
  handleSelectAll?: () => void
  selectAll?: boolean
  handleSelectItem?: (bet: IBet) => void
}

const getsportsname = (sportsId: any) => {
  return sportsId != ''
    ? CONSTANTS.SPORT_NAME.filter((Item: any) => Item.id == sportsId)[0]?.name || 'Casino'
    : ''
}

const BetListComponent2 = ({
  bethistory,
  onTrash,
  handlePageClick,
  isTrash,
  handleSelectAll,
  selectAll,
  handleSelectItem,
}: BetListProps) => {

  const userState = useAppSelector<{ user: User }>(selectUserData)

  // 🔥 NEW STATES
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<IBet | null>(null)
  const [isBack, setIsBack] = useState(true)
  const [odds, setOdds] = useState("")

  // 🔥 OPEN MODAL
  const openEditModal = (bet: IBet) => {
    setSelectedBet(bet)
    setIsBack(bet.isBack)
    setOdds(bet.odds?.toString() || "")
    setIsModalOpen(true)
  }

  // 🔥 UPDATE API CALL
  const handleUpdateBet = async () => {
    try {
      if (!selectedBet) return

      await betService.updateBet({
        betId: selectedBet._id,
        isBack,
        odds: Number(odds),
      })

      setIsModalOpen(false)
      alert("Bet Updated Successfully")
    } catch (err) {
      alert("Error updating bet")
    }
  }

  const trrepeat = (Item: IBet, index: number) => {
    const classdata = Item.isBack ? 'back' : 'lay'
    return (
      <tr key={index} className={classdata}>
        
        {handleSelectAll && (
          <td>
            <input
              type={'checkbox'}
              checked={Item.selected || false}
              onChange={() => handleSelectItem?.(Item)}
            />
          </td>
        )}

        {userState?.user?.role !== RoleType.user && (
          <td className='text-center wnwrap'>{Item.parentNameStr}</td>
        )}

        <td className='text-center wnwrap'>{Item.userName}</td>
        <td className='text-center wnwrap'>{Item.matchName}</td>

        <td className='text-center wnwrap'>
          {Item.selectionName} /{' '}
          {Item.marketName === 'Fancy' && Item.gtype !== 'fancy1' ? Item.volume : Item.odds}
        </td>

        <td className='text-center wnwrap'>{getsportsname(Item.sportId)}</td>
        <td className='text-center wnwrap'>{Item.marketName}</td>
        <td className='text-center wnwrap'>{Item.odds}</td>
        <td className='text-center wnwrap'>{Item.stack}</td>

        <td className='text-center wnwrap'>
          {Item.status=='completed'
            ? Item?.profitLoss?.toFixed(2)
            : Item.pnl?.toFixed(2)}
        </td>

        <td className='text-center wnwrap'>
          {Item.createdAt &&
            moment.utc(Item?.betClickTime).format(betDateFormat)}
        </td>

        {/* 🔥 EXISTING ACTION */}
        {isTrash && (
          <td className='text-center wnwrap'>
            {Item.status == 'pending' && userState?.user?.role === RoleType.admin && (
              <>
                <a onClick={(e) => onTrash && onTrash(e, Item)} href='#'>
                  <i className='fa fa-trash' />
                </a>

               
              </>
            )}
          </td>

          
        )}

         {isTrash && (
          <td className='text-center wnwrap'>
            {Item.status == 'pending' && userState?.user?.role === RoleType.admin && (
              <>
               
                {/* 🔥 NEW ACTION2 BUTTON */}
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => openEditModal(Item)}
                >
                  Action2
                </button>
              </>
            )}
          </td>

          
        )}
      </tr>
    )
  }

  const TransactionData =
    bethistory && bethistory.docs && bethistory.docs.length ? (
      bethistory.docs.map((item: IBet, index: number) => {
        return trrepeat(item, index)
      })
    ) : (
      <tr>
        <td colSpan={11} style={{ textAlign: 'center' }}>
          No Result Found
        </td>
      </tr>
    )

  return (
    <>
      <div className='table-responsive'>
        <table id='customers1'>
          <thead>
            <tr>
              {handleSelectAll && (
                <th className='text-center bg2 text-white '>
                  <input
                    type={'checkbox'}
                    checked={selectAll || false}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {userState?.user?.role !== RoleType.user && (
                <th className='text-center bg2 text-white '>Parent</th>
              )}
              <th className='text-center bg2 text-white '>User Name</th>
              <th className='text-center bg2 text-white '>Event Name</th>
              <th className='text-center bg2 text-white '>Nation</th>
              <th className='text-center bg2 text-white '>Game Name</th>
              <th className='text-center bg2 text-white '>Bet On</th>
              <th className='text-center bg2 text-white '>Rate</th>
              <th className='text-center bg2 text-white '>Amount</th>
              <th className='text-center bg2 text-white '>P/L</th>
              <th className='text-center bg2 text-white '>Place Date</th>
              {isTrash && (
                <th className='text-center bg2 text-white '>Action</th>
              )}
              {isTrash && (
                <th className='text-center bg2 text-white '>Action 2</th>
              )}
            </tr>
          </thead>

          <tbody>{TransactionData}</tbody>
        </table>
      </div>

      {/* 🔥 PAGINATION */}
      <ReactPaginate
        breakLabel='...'
        nextLabel='>>'
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={bethistory.totalPages || 0}
        containerClassName={'pagination'}
        activeClassName={'active'}
        previousLabel={'<<'}
      />

      {/* 🔥 MODAL */}
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
      >
        <h3>Update Bet</h3>

        <div>
          <label>Is Back</label>
          <select value={isBack ? "true" : "false"} onChange={(e) => setIsBack(e.target.value === "true")}>
            <option value="true">Back</option>
            <option value="false">Lay</option>
          </select>
        </div>

        <div>
          <label>Odds</label>
          <input
            type="number"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            style={{border:"2px,solid,blue"}}
          />
        </div>

        <button onClick={handleUpdateBet} style={{background:"blue",color:"white",fontSize:"15px",padding:"4px"}}>Update</button>
        <button onClick={() => setIsModalOpen(false)} style={{background:"red",color:"white",marginLeft:"5px",fontSize:"15px",padding:"4px"}}>Cancel</button>
      </ReactModal>
    </>
  )
}

export default BetListComponent2