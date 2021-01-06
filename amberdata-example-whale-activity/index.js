// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document)

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {
      config.thresholdValue = parseInt($('#threshold').val())
      config.blockchainId = $("select[data-name='blockchain']").val()
      const symbol = blockchainSymbol[config.blockchainId]

      $('#currency-indicator').text(symbol)
      config.w3d = new Web3Data(config.apiKey)

      getPrice(config.blockchainId)
      initWebSockets()
    })

    const TWEET_TEXT = "Check out this large transaction I discovered using @Amberdataio&#39;s API!"

    const config = {
      _apiKey: 'UAK000000000000000000000000demo0001',
      thresholdSign: '>',
      thresholdValue: 10,
      thresholdCurrency: 'eth',
      blockchainId: '',
      isLive: true,
      priceUSD: 0,
      set blockchain(blockchainId) {
        getPrice(blockchainId, this.blockchainId)
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

    let hasLoader = true;

    const QUOTE_USD = {quote: 'usd'}

    const getPrice = async (newBlockchainId, prevBlockchainId = '' ) => {
      const pair = blockchainBase[newBlockchainId] + '_usd'
      if(config.w3d && config.w3d.websocket && config.w3d.websocket.connected) {
        config.w3d.off({eventName: 'market:prices', filters: { pair: blockchainBase[prevBlockchainId] + '_usd' }})
      } else {
        config.w3d.connect()
      }

      const w3d = config.w3d

      const priceData = await w3d.market.getPrices(pair).then(i => i.price)
      config.priceUSD = priceData

      w3d.on({eventName: 'market:prices', filters: { pair }}, ({price}) => {
        config.priceUSD = price > 0 ? price : config.priceUSD
      })
    }

    const insertTransaction = (type, hash, amount, block, time, blockchainId, valueUsd) => {
      clearLoader(type)
      $(`#${type}-txns`).prepend(`
        <div class="box entry">
          <div class="columns" >
              <div class="amount-container column is-4">
                <img class="blockchain-logo" src="assets/${blockchainLogos[blockchainId]}">
                <div class="amount">
                  <div class="amount_digital-asset">${blockchainSymbol[blockchainId]} ${amount}</div>
                  <div class="amount_usd">${valueUsd}</div>
                </div>
              </div>
              <div class="column is-8 txn-details">
                <div class="hash"><a target="_blank" href="${blockchainLink[blockchainId]}${hash}">${hash.slice(0,15)}...</a></div>
                <div class="txn-details-sub">
                  <div class="blocknumber">${block ? '❒ '+ new Intl.NumberFormat().format(block) : ''}</div>
                  <div class="timestamp">${time || '-'}</div>
                </div>
                <div class="links">
                  <a target="_blank" href="https://twitter.com/intent/tweet?text=${encodeURI(TWEET_TEXT + '\n\n' + blockchainLink[blockchainId] + hash) }"><img src="assets/twit.png" alt=""></a>
                </div>
              </div>
          </div>
        </div>
        `)
    }

    const clearTransactions = () => {
      ['pending', 'confirmed'].map(type => $(`#${type}-txns`).empty())
    }

    const clearLoader = (type) => {
      const spinner = $(`#${type}-txns .spinner`)
      if(!spinner.prop('hidden')) {
        spinner.prop('hidden', true)
      }
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
        const value = config.thresholdCurrency === 'usd' ? txnValue * config.priceUSD : txnValue


        if( meetsThreshold(value, config.thresholdValue, config.thresholdSign) ) {
          insertTransaction(
            'confirmed',
            txn.hash,
            round(txnValue, 2),
            txn.blockNumber,
            txn.timestamp ? (new Date(txn.timestamp) ).toLocaleString() : null,
            txn.blockchainId,
            formatter.format(txnValue * config.priceUSD)
          )
        }
      })
      const pendingTxns = {}
      web3data.on({eventName: 'pending_transactions'}, txn => {
        if(txn.hash in pendingTxns) return
        if(!config.isLive) return // If the app is paused don't insert new txns
        const txnValue = toBaseDenom[txn.blockchainId](txn.value)
        const value = config.thresholdCurrency === 'usd' ? txnValue * config.priceUSD : txnValue
        if( meetsThreshold(value, config.thresholdValue, config.thresholdSign) ) {
          insertTransaction(
            'pending',
            txn.hash,
            round(txnValue, 2),
            txn.blockNumber,
            txn.timestamp ? (new Date(txn.timestamp) ).toLocaleString() : null,
            txn.blockchainId,
            formatter.format(txnValue * config.priceUSD)
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
        config[$(this).data("name")] = $(this).val()

      }, 500)

    })

    $( "select" ).change(function() {
      const name = $(this).data("name")
      const optionValue = $("option:selected", this).val()
      config[name] = optionValue
      if(name === 'blockchain') {
        $('#currency-indicator').text(blockchainSymbol[optionValue])
        $("select[data-name='thresholdCurrency'] option:first-child").text(blockchainSymbol[optionValue])
        clearTransactions()
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
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })

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

    const blockchainBase = {
      '1c9c969065fcd1cf': 'eth',
      '408fa195a34b533de9ad9889f076045e': 'btc',
      'f94be61fd9f4fa684f992ddfd4e92272': 'ltc'
    }

    const blockchainLink = {
      '1c9c969065fcd1cf': 'https://amberdata.io/dashboards/?hash=',
      '408fa195a34b533de9ad9889f076045e': 'https://amberdata.io/dashboards/?hash=',
      'f94be61fd9f4fa684f992ddfd4e92272': 'https://amberdata.io/dashboards/?hash='
    }

    const round = (n, digits) => Number.parseFloat(n).toFixed(digits)
}))
