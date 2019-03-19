// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {

        console.log('The DOM is ready');
        // The DOM is ready!

        await getAndDisplayData('0x0b44611b8ae632be05f24ffe64651f050402ae01')

    });

    console.log('The DOM may not be ready');

    let round = (n, digits) => Number.parseFloat(n).toFixed(digits)
    let toEth = (wei) => wei / 1000000000000000000

    let setBalance = (balance) => $('#bal').text(balance)
    let setAddress = (address) => $('.address').text(address)

    let setDate = (unixTime) => {
        let date = new Date(unixTime)
        let localTime = date.toLocaleTimeString().split(' ')[0].slice(0,-3)
        let period = date.toLocaleTimeString().split(' ')[1].toLowerCase()
        let dateString = date.toLocaleDateString()
        $('.date').text(`Updated: ${localTime}${period} - ${dateString}`)
    }

    let updateBalanceUI = (data) => {
        setAddress(data.address)

        if (data.totalRecords < 1) {
            setBalance('0 Ether')
        } else {
            let balanceWei  = data.records[0].value
            let balanceEth = round(toEth(balanceWei), 4)
            setBalance(`${balanceEth} Ether`)
            setDate(data.records[0].timestamp)
        }

    }

    /* Takes in returned axios object extracts the data we want */
    let extractData = (data) => data.data.payload

    let getEthPrice = async () => {
        let exchange = 'gdax'
        let data = await axios({
            method:'get',
            url: `https://web3api.io/api/v1/market/tickers/eth_usd/latest?exchange=${exchange}`,
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
        return data.data.payload[exchange].mid
    }

    let getAddressBalance = async (address) => {
        return await axios({
            method:'get',
            url: `https://web3api.io/api/v1/addresses/${address}/account-balances/latest`,
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }

    let getAddressTransactions = async (address) => {
        return await axios({
            method:'get',
            url: `https://web3api.io/api/v1/addresses/${address}/transactions?page=0&size=10`,
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }

    let setLoading = (bool) => {

        let loader = $('.loader')

        loader.css('opacity', bool ? '1' : '0')

        loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
            function(e) {
                loader.css('visibility', bool ? 'visible' : 'hidden')
                $('.data').css('opacity', bool ? '0': '1')

            });
        if (bool) {
            $('.txn-list-content').empty();
        }
        $('.transactions-list').css('opacity', bool ? '0': '1')
    }

    let setTxnsLoading = (bool) => {
        let loader = $('.txn-loader')
        if (bool) {
            $('.txn-list-content').empty();
        }
        $('.transactions-list').css('opacity', bool ? '0': '1')
    }

    let log = (message) => console.log(message)

    let toFormatedNumber = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let toStringUSD = (dollars) => `$${toFormatedNumber(round(dollars, 2))}`
    let toStringETH = (ethereum) => ` Ether`

    let ethToUSD = async (data) => {
        if (data.totalRecords < 1) {
            return 0
        } else {
            let price = await getEthPrice()
            let inUSD = toEth(data.records[0].value) * price
            log(toStringUSD(inUSD))
            return inUSD
        }
    }

    let getAndDisplayData = async (address) => {
        if ( !isAddress(address) ) { return }

        // TODO: make 2 separate loaders
        setLoading(true)

        try {

            let balanceData = await getAddressBalance(address)
            balanceData = extractData(balanceData)
            balanceData['address'] = address
            updateBalanceUI(balanceData)

            setLoading(false)

            let txnData = await getAddressTransactions(address)

            updateTransactionsList(extractData(txnData).records)

        } catch (err) {
            log(err)
            setBalance('¯\\_(ツ)_\/¯')
            $('.date').html('Rats, something\'s not quite right <br\> Try again!')
        } finally {
            setLoading(false)
        }
    }



    let updateTransactionsList = (transactions) => {

        //TODO: Check for empty array
        let template, i

        // Get the template element:
        template = $('template')[0].content.querySelector("div")
        log(transactions)
        log(template)

        for (i = 0; i < transactions.length; i++) {
            let entry = document.importNode(template, true);
            let eth = round(toEth(transactions[i].value), 4)
            let hash = transactions[i].hash
            $(entry).find('.txn-value').text(`Value: ${eth} Ether`)
            $(entry).find('.txn-hash').text(`Hash: ${truncHash(hash)}`)
            $(entry).find('.txn-view').find('a').attr('href', `https://amberdata.io/transactions/${hash}`)
            $('.txn-list-content').append(entry)
        }
    }

    let truncHash = (hash) => `${hash.slice(0,10)}...`

    // Get the input box
    let textInput = document.getElementById('address-input-field');

    // Init a timeout variable to be used below
    let timeout = null;

    // Listen for keystroke events
    textInput.onkeyup = function (e) {

        // Clear the timeout if it has already been set.
        // This will prevent the previous task from executing
        // if it has been less than <MILLISECONDS>
        clearTimeout(timeout);

        // Make a new timeout set to go off in 800ms
        timeout = setTimeout(async () => {
            await getAndDisplayData(textInput.value.toLowerCase());
        }, 500);
    };

    /**
     * Checks if the given string is an address
     *
     * @method isAddress
     * @param {String} address the given HEX address
     * @return {Boolean}
     */
    let isAddress = function (address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // check if it has the basic requirements of an address
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            return isChecksumAddress(address);
        }
    };

    /**
     * Checks if the given string is a checksummed address
     *
     * @method isChecksumAddress
     * @param {String} address the given HEX adress
     * @return {Boolean}
     */
    let isChecksumAddress = function (address) {
        // Check each case
        address = address.replace('0x','');
        var addressHash = sha3(address.toLowerCase());
        for (var i = 0; i < 40; i++ ) {
            // the nth letter should be uppercase if the nth digit of casemap is 1
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    };

}));
