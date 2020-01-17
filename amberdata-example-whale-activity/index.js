// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {
      initWebSockets()
    });

    let web3data;

    const config = {
      _apiKey: 'UAK000000000000000000000000demo0001',
      thresholdSign: '>',
      thresholdValue: 10,
      blockchainId: '',
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

    const insertTransaction = (type, hash, amount, block, time) => {
      console.log(`#${type}-txns`);
      $(`#${type}-txns`).prepend(`
        <div class="box entry">
          <div class="columns">
            <div class="column">${hash}</div>
            <div class="column">${amount}</div>
            <div class="column">${block || '-'}</div>
            <div class="column">${time}</div>
          </div>
        </div>
        `)
    }

    const meetsThreshold = (value, thresholdValue, thresholdSign) => {
      switch (thresholdSign) {
        case '>': return value > thresholdValue;
        case '<': return value < thresholdValue;
        case '≥': return value >= thresholdValue;
        case '≤': return value <= thresholdValue;
        default: break;
      }
    }



    /** Init */
    const initWebSockets = () => {
      if(!config.apiKey) return
      const web3data = new Web3Data(config.apiKey, {
        blockchainId: config.blockchainId
      })
      web3data.connect()
      web3data.on({eventName: 'transactions'}, txn => {
        const txnValue = toBaseDenom[txn.blockchainId](txn.value)
        if( meetsThreshold(txnValue, config.thresholdValue, config.thresholdSign) ) {
          insertTransaction(
            'confirmed',
            txn.hash.slice(0,10),
            round(txnValue, 2),
            txn.blockNumber,
            txn.timestamp)
          console.log('confirmed - ', txnValue);
        }
      })
      web3data.on({eventName: 'pending_transactions'}, txn => {
          const txnValue = toBaseDenom[txn.blockchainId](txn.value)
          if( meetsThreshold(txnValue, config.thresholdValue, config.thresholdSign) ) {
            insertTransaction(
              'pending',
              txn.hash.slice(0,10),
              round(txnValue, 2),
              txn.blockNumber,
              (new Date(txn.timestamp) ).toLocaleString())
            console.log('pending - ', txnValue);
          }
      })
    }

    let timeout = null; // Init a timeout variable to be used below
    $( ".input" ).keyup(function() {

       // Clear the timeout if it has already been set. Prevents previous
       // task from executing if it's been less than <MILLISECONDS>
      clearTimeout(timeout);

      // Make a new timeout set to go off in 800ms
      timeout = setTimeout(async () => {

        // Execute the task here after 500ms
        config[$(this).data("name")] = $(this).val()

        // TODO: Reinit websockets/(UI too maybe?)
        console.log(config)
      }, 500);

    });

    $( "select" ).change(function() {

      // TODO: Reinit websockets/(UI too maybe?)
      config[$(this).data("name")] = $("option:selected", this).val();
      console.log(config)
    });

    /* Helpers */

    // Converts values from lowest to base denomination
    const toBaseDenom = {
      '1c9c969065fcd1cf': wei => wei / Math.pow(10, 18), // Eth
      '408fa195a34b533de9ad9889f076045e': sat => sat / Math.pow(10, 8), // Btc
      'f94be61fd9f4fa684f992ddfd4e92272': photon => photon / Math.pow(10, 8), // Ltc
    }

    // TODO: sanitize sign input?
    const sign = () => {}

    const round = (n, digits) => Number.parseFloat(n).toFixed(digits)


}));
