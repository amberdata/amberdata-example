// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document)

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {
      config.thresholdValue = parseInt($('#threshold').val())
      initWebSockets()
    })

    const config = {
      _apiKey: 'UAK000000000000000000000000demo0001',
      thresholdSign: '>',
      thresholdValue: 10,
      blockchainId: '',
      isLive: true,
      set blockchain(blockchainId) {
        this.blockchainId = blockchainId
        initWebSockets()
      },
      get blockchain() {
        return this.blockchainId
      },
      set apiKey(key) {
        this._apiKey = key
        initWebSockets()
      },
      get apiKey() {
        return this._apiKey
      }
    }

    const insertTransaction = (type, hash, amount, block, time, blockchainId) => {
      $(`#${type}-txns`).prepend(`
        <div class="box entry">
          <a target="_blank" href="https://amberdata.io/transactions/${hash}">
            <div class="columns">
              <div class="amount-container column is-4">
                <img class="blockchain-logo" src="assets/${blockchainLogos[blockchainId]}">
                <div class="amount">${blockchainSymbol[blockchainId]} ${amount}</div>
              </div>
              <div class="column is-8 txn-details">
                <div class="hash"><p>${hash.slice(0,30)}...</p></div>
                <div class="txn-details-sub">
                  <div class="blocknumber">${block ? '❒ '+block : ''}</div>
                  <div class="timestamp">${time || '-'}</div>
                </div>
              </div>
            </div>
          </a>
        </div>
        `)
    }

    const clearTransactions = () => {
      ['pending', 'confirmed'].map(type => $(`#${type}-txns`).empty())
    }

    const meetsThreshold = (value, thresholdValue, thresholdSign) => {
      switch (thresholdSign) {
        case '>': return value >  thresholdValue
        case '<': return value <  thresholdValue
        case '≥': return value >= thresholdValue
        case '≤': return value <= thresholdValue
        default: break
      }
    }

    let web3data

    const initWebSockets = () => {
      if(!config.apiKey) return
      if(web3data) web3data.disconnect()
      web3data = new Web3Data(config.apiKey, {
        blockchainId: config.blockchainId
      })
      web3data.connect()
      web3data.on({eventName: 'transactions'}, txn => {
        if(!config.isLive) return // If the app is paused don't insert new txns
        const txnValue = toBaseDenom[txn.blockchainId](txn.value)
        if( meetsThreshold(txnValue, config.thresholdValue, config.thresholdSign) ) {
          insertTransaction(
            'confirmed',
            txn.hash,
            round(txnValue, 2),
            txn.blockNumber,
            txn.timestamp ? (new Date(txn.timestamp) ).toLocaleString() : null,
            txn.blockchainId
          )
        }
      })
      web3data.on({eventName: 'pending_transactions'}, txn => {
        if(!config.isLive) return // If the app is paused don't insert new txns
        const txnValue = toBaseDenom[txn.blockchainId](txn.value)

        if( meetsThreshold(txnValue, config.thresholdValue, config.thresholdSign) ) {
          insertTransaction(
            'pending',
            txn.hash,
            round(txnValue, 2),
            txn.blockNumber,
            txn.timestamp ? (new Date(txn.timestamp) ).toLocaleString() : null,
            txn.blockchainId
          )
        }
      })
    }

    let timeout = null // Init a timeout variable to be used below
    $( ".input" ).keyup(function() {

       // Clear the timeout if it has already been set. Prevents previous
       // task from executing if it's been less than <MILLISECONDS>
      clearTimeout(timeout)

      // Make a new timeout set to go off in 800ms
      timeout = setTimeout(async () => {

        // Execute the task here after 500ms
        // TODO: check that value is number regex
        config[$(this).data("name")] = $(this).val()

      }, 500)

    })

    $( "select" ).change(function() {
      const name = $(this).data("name")
      const optionValue = $("option:selected", this).val()
      config[name] = optionValue
      if(name === 'blockchain') {
        $('#currency-indicator').text(blockchainSymbol[optionValue])
      }
    })

    $('#clear-button').click(function(){
      clearTransactions()
    })

    $('#stop-button').click(function(){
      config.isLive = false
      $(this).addClass('is-danger is-selected')
      $('#live-button').removeClass('is-success is-selected')
    })

    $('#live-button').click(function(){
      config.isLive = true
      $(this).addClass('is-success is-selected')
      $('#stop-button').removeClass('is-danger is-selected')
    })

    /* Helpers */

    // Converts values from lowest to base denomination
    const toBaseDenom = {
      '1c9c969065fcd1cf': wei => wei / Math.pow(10, 18), // Eth
      '408fa195a34b533de9ad9889f076045e': sat => sat / Math.pow(10, 8), // Btc
      'f94be61fd9f4fa684f992ddfd4e92272': photon => photon / Math.pow(10, 8), // Ltc
    }

    // Returns the logo based on the blockchainId
    const blockchainLogos = {
      '1c9c969065fcd1cf': 'ethereum.svg',
      '408fa195a34b533de9ad9889f076045e': 'bitcoin.png',
      'f94be61fd9f4fa684f992ddfd4e92272': 'litecoin.png'
    }

    // Returns the symbol based on the blockchainId
    const blockchainSymbol = {
      '1c9c969065fcd1cf': 'Ξ',
      '408fa195a34b533de9ad9889f076045e': '₿',
      'f94be61fd9f4fa684f992ddfd4e92272': 'Ł'
    }

    const round = (n, digits) => Number.parseFloat(n).toFixed(digits)
}))
