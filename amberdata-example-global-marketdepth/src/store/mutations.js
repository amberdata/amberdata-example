export default {
  // Generic update
  UPDATE(state, { key, value }) {
    state[key] = value
  },

  UPDATEALL(state, obj) {
    Object.keys(obj).forEach(k => {
      state[k] = obj[k]
    })
  },

  PUSH(state, { key, value }) {
    if (!state[key] || !Array.isArray(state[key])) return
    state[key].push(value)
  },

  UNSHIFT(state, { key, value }) {
    if (!state[key] || !Array.isArray(state[key])) return
    state[key] = state[key].unshift(value)
  },

  SHIFT(state, { key, value }) {
    if (!state[key] || !Array.isArray(state[key])) return
    state[key] = state[key].shift(value)
  },

  DELETE(state, { key, idx }) {
    if (!state[key] || !Array.isArray(state[key])) return
    state[key].splice(idx, 1)
  },

  ADDSUBITEM(state, { key, subKey, value, extend = false }) {
    if (!state[key]) return
    let base = extend ? { ...state[key][subKey] } : {}
    // flush cache
    delete state[key][subKey]
    // next tick
    setTimeout(() => {
      state[key][subKey] = extend ? { ...base, ...value } : value
    }, 100)
  },

  REMOVESUBITEM(state, { key, subKey }) {
    if (!state[key]) return
    delete state[key][subKey]
  },

  ADDEXCHANGEPRICE(state, { exchange, timestamp, price, price24hr, volume }) {
    if (!exchange) return
    // TODO: Remove once ftx is fixed
    if (exchange === 'ftx') return
    const data = state.exchanges && state.exchanges[exchange] ? state.exchanges[exchange] : {}
    let base = { ...data }
    // flush cache
    // if (state.exchanges && state.exchanges[exchange]) delete state.exchanges[exchange]
    // next tick
    setTimeout(() => {
      // MAke sure timestamp is greater than previous
      if (data && data.timestamp && timestamp > data.timestamp) state.exchanges[exchange] = { ...base, price, timestamp }
      else if (exchange && price24hr) state.exchanges[exchange] = { ...base, price, price24hr, timestamp, volume }
    }, 100)
  },
}