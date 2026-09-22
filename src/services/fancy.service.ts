import api from '../utils/api'
class FancyService {
  getActiveFancies(matchId: number | string, status: string) {
    return api.get(`active-fancies?matchId=${matchId}&gtype=${status}`)
  }
  
  suspendFancy(marketId: number | string, matchId: number, type: 'isSuspend' | 'active') {
    return api.get(`suspend-fancy?marketId=${marketId}&matchId=${matchId}&type=${type}`)
  }

  fancyResult(marketId: number | string, matchId: number, result: string) {
    return api.get(`result-fancy?marketId=${marketId}&matchId=${matchId}&result=${result}`)
  }
  fancyResultRollback(marketId: number | string, matchId: number) {
    return api.get(`fancy-result-rollback?marketId=${marketId}&matchId=${matchId}`)
  }
  fancyResultUserRollback(
  marketId: any,
  matchId: any,
  userIds: string[],
) {
  return api.post('/fancy-result-user-rollback', {
    marketId,
    matchId,
    userIds,
  })
}
}
export default new FancyService()
