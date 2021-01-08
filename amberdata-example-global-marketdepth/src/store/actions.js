export default {
  // Generic Update
  update({ commit }, { key, value }) {
    commit('UPDATE', { key, value })
  },

  pushItem({ commit }, { key, value }) {
    commit('PUSH', { key, value })
  },

  shiftItem({ commit }, { key, value }) {
    commit('SHIFT', { key, value })
  },

  unshiftItem({ commit }, { key, value }) {
    commit('UNSHIFT', { key, value })
  },

  deleteItem({ commit }, { key, idx }) {
    commit('DELETE', { key, idx })
  },

  addSubItem({ commit }, { key, subKey, value }) {
    commit('ADDSUBITEM', { key, subKey, value })
  },

  removeSubItem({ commit }, { key, subKey }) {
    commit('REMOVESUBITEM', { key, subKey })
  },

  setApiKey({ commit }, apiKey) {
    localStorage.setItem('apiKey', apiKey)
    commit('UPDATE', { key: 'apiKey', value: apiKey })
  },
  loadApiKeyFromCache({ commit, state }) {
    if (state.apiKey) return
    const apiKey = localStorage.getItem('apiKey')
    if (apiKey) {
      commit('UPDATE', { key: 'apiKey', value: apiKey })
    }
  },
}
