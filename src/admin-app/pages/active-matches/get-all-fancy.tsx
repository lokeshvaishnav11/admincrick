// import { AxiosResponse } from 'axios'
// import React, { FormEvent } from 'react'
// import ReactModal from 'react-modal'
// import { useParams } from 'react-router-dom'
// import { toast } from 'react-toastify'
// import LFancy from '../../../models/LFancy'
// import fancyService from '../../../services/fancy.service'

// const GetAllFancy = () => {
//   const [fancies, setFancies] = React.useState([])
//   const [fancy, setFancy] = React.useState<LFancy>({} as LFancy)
//   const [result, setResult] = React.useState<string | null>(null)
//   const [status, setStatus] = React.useState<string>('session')
//   const [isOpen, setIsOpen] = React.useState(false)

//   const { matchId } = useParams()

//   const getFancyResult = () => {
//     fancyService.getActiveFancies(matchId!, status).then((res: AxiosResponse) => {
//       setFancies(res.data.data)
//     })
//   }
//   React.useEffect(() => {
//     getFancyResult()
//     const timeInterval = setInterval(() => {
//       getFancyResult()
//     }, 20 * 1000)
//     return () => {
//       clearInterval(timeInterval)
//     }
//   }, [status])

//   const resultPropmet = (e: any, fancy: LFancy) => {
//     e.preventDefault()
//     setIsOpen(true)
//     setFancy(fancy)
//   }

//   const onSubmitHandle = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     if (!result) toast.error('Please enter result')

//     fancyService
//       .fancyResult(fancy.marketId, fancy.matchId, result!)
//       .then(() => {
//         toast.success('Result Set')
//         setIsOpen(false)
//         setResult('')
//         getFancyResult()
//       })
//       .catch((e) => {
//         const err = e as Error
//         toast.error(err.message)
//       })
//   }

//   const suspendedFancy = (e: any, fancy: LFancy, type: 'isSuspend' | 'active') => {
//     e.preventDefault()
//     fancyService.suspendFancy(fancy.marketId, fancy.matchId, type).then((res) => {
//       const allFancies = [...fancies]
//       const updatedFancies: any = allFancies.map((el: LFancy) =>
//         el.marketId === fancy.marketId ? { ...fancy, [type]: !fancy[type] } : el,
//       )
//       setFancies(updatedFancies)
//     })
//   }

//   const rollBack = (e: any, fancy: LFancy) => {
//     e.preventDefault()
//     fancyService
//       .fancyResultRollback(fancy.marketId, fancy.matchId)
//       .then(() => {
//         toast.success('Result Rollback Successfully')
//         getFancyResult()
//       })
//       .catch((e) => {
//         const err = e as Error
//         toast.error(err.message)
//       })
//   }

//   const onFancyType = (type: string) => {
//     setStatus(type)
//   }

//   const fancyMenu = (fancyType: string) => {
//     const menus = [
//       { type: 'session', label: 'Fancy' },
//       { type: 'fancy1', label: 'Fancy1' },
//       { type: 'wkt', label: 'Wicket' },
//       { type: 'Four', label: 'Four' },
//       { type: 'Sixes', label: 'Six' },
//       { type: 'meter', label: 'Meter' },
//       { type: 'khado', label: 'Khado' },
//       { type: 'oddeven', label: 'Odd/Even' },
//       { type: 'ballRun', label: 'Ball Run' },
//     ]

//     return menus.map((menu) => (
//       <li style={{display:"none"}} key={menu.type} onClick={(e) => onFancyType(menu.type)} className='nav-item'>
//         <a
//           href='#'
//           onClick={(e) => e.preventDefault()}
//           role='tab'
//           className={`nav-link ${fancyType === menu.type ? 'active' : ''}`}
//         >
//           <span style={{ textTransform: 'uppercase' }}>{menu.label}</span>
//         </a>
//       </li>
//     ))
//   }

//   return (
//     <div className='col-md-12 mt-2'>
//       <div className='' style={{ maxWidth: '100%' }}>
//         <ul
//           role='tablist'
//           className='nav nav-tabs fancy-group d-flex align-items-center justify-content-center'
//           aria-label='Tabs'
//         >
//           {fancyMenu(status)}
//         </ul>
//         <table
//           style={{ width: '100%' }}
//           className='table  table table-striped table-bordered m-t-10'
//         >
//           <tbody>
//             <tr>
//               <td colSpan={8} style={{ fontSize: '18px' }}>
//                 Pending Fancy
//               </td>
//             </tr>
//             {fancies.map((fancy: LFancy, index: number) => (
//               <tr
//                 key={fancy.marketId + fancy.fancyName + index}
//                 style={{
//                   backgroundColor: fancy.result ? '#5eb873' : fancy.bet ? 'yellow' : '',
//                   color: fancy.result ? 'white' : 'black',
//                 }}
//                 role='row'
//                 className='odd'
//               >
//                 <td>
//                   <i
//                     className={`fas fa-circle ${
//                       fancy.active ? 'text-success' : 'text-danger'
//                     } fa-lg mr-2`}
//                   />
//                 </td>
//                 <td className='text-left'>{fancy.fancyName}</td>
//                 <td className='text-left'>{fancy.result}</td>
//                 <td className='text-left'>{fancy.active ? 'Active' : 'In-Active'}</td>
//                 <td className='text-left'>{fancy.isSuspend ? 'Suspend' : 'Un-Suspend'}</td>
//                 <td className='text-left'>
//                   <a onClick={(e) => suspendedFancy(e, fancy, 'active')} href='#'>
//                     InActivate
//                   </a>
//                 </td>
//                 <td className='text-left'>
//                   <a onClick={(e) => suspendedFancy(e, fancy, 'isSuspend')} href='#'>
//                     Click To Suspend
//                   </a>
//                 </td>
//                 <td className='text-left'>
//                   {!fancy.result && (
//                     <a onClick={(e) => resultPropmet(e, fancy)} href='#'>
//                       Result Declare
//                     </a>
//                   )}
//                   {fancy.result && (
//                     <a onClick={(e) => rollBack(e, fancy)} href='#'>
//                       Rollback
//                     </a>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal Popup */}
      
//       <ReactModal
//         isOpen={isOpen}
//         onRequestClose={(e: any) => {
//           setIsOpen(false)
//         }}
//         contentLabel='Set Max Bet Limit'
//         className={'modal-dialog'}
//         ariaHideApp={false}
//       >
//         <div className='modal-content'>
//           <div className='modal-header'>
//             <h5>Set Result {fancy.fancyName}</h5>
//             <button onClick={() => setIsOpen(false)} className='close float-right'>
//               X
//             </button>
//           </div>
//           <form onSubmit={onSubmitHandle} className='form loginform'>
//             <div className='modal-body'>
//               <div className='row form-group'>
//                 <div className='col-md-5'>
//                   <label>Enter Result</label>
//                 </div>
//                 <div className='col-md-7'>
//                   <input
//                     type={'text'}
//                     name={'result'}
//                     onChange={(e) => setResult(e.target.value)}
//                     value={result || ''}
//                   />
//                   {fancy.gtype === 'fancy1' && <strong>Note: Yes=1, No=0</strong>}
//                 </div>
//               </div>
//               <label>
//                 <input
//                   type={'checkbox'}
//                   name={'result'}
//                   onChange={(e) => setResult(e.target.value)}
//                   value={'-1'}
//                 />{' '}
//                 Abandoned
//               </label>
//             </div>
//             <div className='modal-footer'>
//               <button
//                 type='button'
//                 onClick={() => setIsOpen(false)}
//                 className='btn btn-info'
//                 data-dismiss='modal'
//               >
//                 <i className='fas fa-undo-alt' /> Close
//               </button>
//               <button type='submit' className='btn btn-primary'>
//                 <i className='fas fa-paper-plane' /> Submit
//               </button>
//             </div>
//           </form>
//         </div>
//       </ReactModal>
//       {/* End Modal */}
//     </div>
//   )
// }

// export default GetAllFancy


import { AxiosResponse } from 'axios'
import React, { FormEvent } from 'react'
import ReactModal from 'react-modal'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import LFancy from '../../../models/LFancy'
import fancyService from '../../../services/fancy.service'

const GetAllFancy = () => {
  const [fancies, setFancies] = React.useState<LFancy[]>([])
  const [fancy, setFancy] = React.useState<LFancy>({} as LFancy)
  const [result, setResult] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>('session')

  // Result modal
  const [isOpen, setIsOpen] = React.useState(false)

  // Rollback modal
  const [rollbackOpen, setRollbackOpen] = React.useState(false)
  const [rollbackType, setRollbackType] =
    React.useState<'all' | 'specific'>('all')

  const [rollbackUserIds, setRollbackUserIds] = React.useState('')

  const { matchId } = useParams()

  const getFancyResult = () => {
    fancyService
      .getActiveFancies(matchId!, status)
      .then((res: AxiosResponse) => {
        setFancies(res.data.data || [])
      })
  }

  React.useEffect(() => {
    getFancyResult()

    const timeInterval = setInterval(() => {
      getFancyResult()
    }, 20 * 1000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [status])

  // ============================
  // RESULT POPUP
  // ============================

  const resultPropmet = (e: any, fancy: LFancy) => {
    e.preventDefault()

    setFancy(fancy)
    setResult(null)
    setIsOpen(true)
  }

  const onSubmitHandle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      result === null ||
      result === undefined ||
      String(result).trim() === ''
    ) {
      toast.error('Please enter result')
      return
    }

    fancyService
      .fancyResult(fancy.marketId, fancy.matchId, result)
      .then(() => {
        toast.success('Result Set')
        setIsOpen(false)
        setResult('')
        getFancyResult()
      })
      .catch((e) => {
        const err = e as Error
        toast.error(err.message)
      })
  }

  // ============================
  // SUSPEND / ACTIVE
  // ============================

  const suspendedFancy = (
    e: any,
    fancy: LFancy,
    type: 'isSuspend' | 'active',
  ) => {
    e.preventDefault()

    fancyService
      .suspendFancy(fancy.marketId, fancy.matchId, type)
      .then(() => {
        const allFancies = [...fancies]

        const updatedFancies: any = allFancies.map((el: LFancy) =>
          el.marketId === fancy.marketId
            ? {
                ...fancy,
                [type]: !fancy[type],
              }
            : el,
        )

        setFancies(updatedFancies)
      })
      .catch((e) => {
        toast.error(
          e?.response?.data?.message ||
            e?.message ||
            'Something went wrong',
        )
      })
  }

  // ============================
  // OPEN ROLLBACK POPUP
  // ============================

  const openRollbackModal = (e: any, fancyData: LFancy) => {
    e.preventDefault()

    setFancy(fancyData)

    // Default = full rollback
    setRollbackType('all')
    setRollbackUserIds('')

    setRollbackOpen(true)
  }

  const closeRollbackModal = () => {
    setRollbackOpen(false)
    setRollbackType('all')
    setRollbackUserIds('')
  }

  // ============================
  // ROLLBACK
  // ============================

  const rollBack = async () => {
    try {
      // ----------------------------
      // FULL ROLLBACK
      // ----------------------------

      if (rollbackType === 'all') {
        await fancyService.fancyResultRollback(
          fancy.marketId,
          fancy.matchId,
        )

        toast.success('Full Result Rollback Successfully')

        closeRollbackModal()
        getFancyResult()

        return
      }

      // ----------------------------
      // SPECIFIC USER ROLLBACK
      // ----------------------------

      if (!rollbackUserIds.trim()) {
        toast.error('Please enter User ID')
        return
      }

      /*
        Supports:

        123
        123,456
        123 456
        123
        456
      */

      const userIds = rollbackUserIds
        .split(/[\s,]+/)
        .map((id) => id.trim())
        .filter(Boolean)

      if (!userIds.length) {
        toast.error('Please enter valid User ID')
        return
      }

      // duplicate IDs remove
const uniqueUserIds = Array.from(new Set(userIds))
      /*
        NEW SERVICE METHOD

        Backend payload:

        {
          marketId: "...",
          matchId: "...",
          userIds: ["id1", "id2"]
        }
      */

      await fancyService.fancyResultUserRollback(
        fancy.marketId,
        fancy.matchId,
        uniqueUserIds,
      )

      toast.success(
        `${uniqueUserIds.length} User Result Rollback Successfully`,
      )

      closeRollbackModal()
      getFancyResult()
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          'Rollback failed',
      )
    }
  }

  // ============================
  // FANCY TYPE
  // ============================

  const onFancyType = (type: string) => {
    setStatus(type)
  }

  const fancyMenu = (fancyType: string) => {
    const menus = [
      { type: 'session', label: 'Fancy' },
      { type: 'fancy1', label: 'Fancy1' },
      { type: 'wkt', label: 'Wicket' },
      { type: 'Four', label: 'Four' },
      { type: 'Sixes', label: 'Six' },
      { type: 'meter', label: 'Meter' },
      { type: 'khado', label: 'Khado' },
      { type: 'oddeven', label: 'Odd/Even' },
      { type: 'ballRun', label: 'Ball Run' },
    ]

    return menus.map((menu) => (
      <li
        style={{ display: 'none' }}
        key={menu.type}
        onClick={() => onFancyType(menu.type)}
        className='nav-item'
      >
        <a
          href='#'
          onClick={(e) => e.preventDefault()}
          role='tab'
          className={`nav-link ${
            fancyType === menu.type ? 'active' : ''
          }`}
        >
          <span style={{ textTransform: 'uppercase' }}>
            {menu.label}
          </span>
        </a>
      </li>
    ))
  }

  return (
    <div className='col-md-12 mt-2'>
      <div style={{ maxWidth: '100%' }}>
        <ul
          role='tablist'
          className='nav nav-tabs fancy-group d-flex align-items-center justify-content-center'
          aria-label='Tabs'
        >
          {fancyMenu(status)}
        </ul>

        <table
          style={{ width: '100%' }}
          className='table table-striped table-bordered m-t-10'
        >
          <tbody>
            <tr>
              <td colSpan={8} style={{ fontSize: '18px' }}>
                Pending Fancy
              </td>
            </tr>

            {fancies.map(
              (fancyItem: LFancy, index: number) => (
                <tr
                  key={
                    fancyItem.marketId +
                    fancyItem.fancyName +
                    index
                  }
                  style={{
                    backgroundColor: fancyItem.result
                      ? '#5eb873'
                      : fancyItem.bet
                      ? 'yellow'
                      : '',

                    color: fancyItem.result
                      ? 'white'
                      : 'black',
                  }}
                  role='row'
                  className='odd'
                >
                  <td>
                    <i
                      className={`fas fa-circle ${
                        fancyItem.active
                          ? 'text-success'
                          : 'text-danger'
                      } fa-lg mr-2`}
                    />
                  </td>

                  <td className='text-left'>
                    {fancyItem.fancyName}
                  </td>

                  <td className='text-left'>
                    {fancyItem.result}
                  </td>

                  <td className='text-left'>
                    {fancyItem.active
                      ? 'Active'
                      : 'In-Active'}
                  </td>

                  <td className='text-left'>
                    {fancyItem.isSuspend
                      ? 'Suspend'
                      : 'Un-Suspend'}
                  </td>

                  <td className='text-left'>
                    <a
                      onClick={(e) =>
                        suspendedFancy(
                          e,
                          fancyItem,
                          'active',
                        )
                      }
                      href='#'
                    >
                      InActivate
                    </a>
                  </td>

                  <td className='text-left'>
                    <a
                      onClick={(e) =>
                        suspendedFancy(
                          e,
                          fancyItem,
                          'isSuspend',
                        )
                      }
                      href='#'
                    >
                      Click To Suspend
                    </a>
                  </td>

                  <td className='text-left'>
                    {!fancyItem.result && (
                      <a
                        onClick={(e) =>
                          resultPropmet(
                            e,
                            fancyItem,
                          )
                        }
                        href='#'
                      >
                        Result Declare
                      </a>
                    )}

                    {fancyItem.result && (
                      <a
                        onClick={(e) =>
                          openRollbackModal(
                            e,
                            fancyItem,
                          )
                        }
                        href='#'
                      >
                        Rollback
                      </a>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* ========================= */}
      {/* RESULT MODAL */}
      {/* ========================= */}

      <ReactModal
        isOpen={isOpen}
        onRequestClose={() => {
          setIsOpen(false)
        }}
        contentLabel='Set Result'
        className='modal-dialog'
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5>
              Set Result {fancy.fancyName}
            </h5>

            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='close float-right'
            >
              X
            </button>
          </div>

          <form
            onSubmit={onSubmitHandle}
            className='form loginform'
          >
            <div className='modal-body'>
              <div className='row form-group'>
                <div className='col-md-5'>
                  <label>Enter Result</label>
                </div>

                <div className='col-md-7'>
                  <input
                    type='text'
                    name='result'
                    onChange={(e) =>
                      setResult(e.target.value)
                    }
                    value={result || ''}
                    className='form-control'
                  />

                  {fancy.gtype === 'fancy1' && (
                    <strong>
                      Note: Yes=1, No=0
                    </strong>
                  )}
                </div>
              </div>

              <label>
                <input
                  type='checkbox'
                  checked={result === '-1'}
                  onChange={(e) =>
                    setResult(
                      e.target.checked
                        ? '-1'
                        : '',
                    )
                  }
                />{' '}
                Abandoned
              </label>
            </div>

            <div className='modal-footer'>
              <button
                type='button'
                onClick={() =>
                  setIsOpen(false)
                }
                className='btn btn-info'
              >
                <i className='fas fa-undo-alt' />{' '}
                Close
              </button>

              <button
                type='submit'
                className='btn btn-primary'
              >
                <i className='fas fa-paper-plane' />{' '}
                Submit
              </button>
            </div>
          </form>
        </div>
      </ReactModal>

      {/* ========================= */}
      {/* ROLLBACK MODAL */}
      {/* ========================= */}

      <ReactModal
        isOpen={rollbackOpen}
        onRequestClose={closeRollbackModal}
        contentLabel='Rollback Result'
        className='modal-dialog'
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5>
              Rollback - {fancy.fancyName}
            </h5>

            <button
              type='button'
              onClick={closeRollbackModal}
              className='close float-right'
            >
              X
            </button>
          </div>

          <div className='modal-body'>
            <div className='form-group'>
              <label
                style={{
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Rollback Type
              </label>

              <div>
                <label
                  style={{
                    marginRight: 25,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type='radio'
                    name='rollbackType'
                    value='all'
                    checked={
                      rollbackType === 'all'
                    }
                    onChange={() =>
                      setRollbackType('all')
                    }
                  />{' '}
                  Full Rollback
                </label>

                <label
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type='radio'
                    name='rollbackType'
                    value='specific'
                    checked={
                      rollbackType ===
                      'specific'
                    }
                    onChange={() =>
                      setRollbackType(
                        'specific',
                      )
                    }
                  />{' '}
                  Specific User
                </label>
              </div>
            </div>

            {rollbackType === 'all' && (
              <div
                className='alert alert-warning'
                style={{
                  marginTop: 15,
                }}
              >
                This will rollback result for
                all users.
              </div>
            )}

            {rollbackType ===
              'specific' && (
              <div
                className='form-group'
                style={{
                  marginTop: 15,
                }}
              >
                <label>
                  User ID / Multiple User IDs
                </label>

                <textarea
                  className='form-control'
                  rows={4}
                  value={rollbackUserIds}
                  onChange={(e) =>
                    setRollbackUserIds(
                      e.target.value,
                    )
                  }
                  placeholder={`Enter User IDs

Example:
64abc123...
64abc456...

OR

64abc123..., 64abc456...`}
                />

                <small className='text-muted'>
                  Multiple IDs comma, space
                  ya new line se enter kar
                  sakte ho.
                </small>
              </div>
            )}
          </div>

          <div className='modal-footer'>
            <button
              type='button'
              onClick={closeRollbackModal}
              className='btn btn-secondary'
            >
              Close
            </button>

            <button
              type='button'
              onClick={rollBack}
              className={
                rollbackType === 'all'
                  ? 'btn btn-danger'
                  : 'btn btn-warning'
              }
            >
              <i className='fas fa-undo-alt' />{' '}
              {rollbackType === 'all'
                ? 'Full Rollback'
                : 'Rollback Selected Users'}
            </button>
          </div>
        </div>
      </ReactModal>
    </div>
  )
}

export default GetAllFancy