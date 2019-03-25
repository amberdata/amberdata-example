// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {

        /* Loads up the UI with a default address */
        let {data, chart} = await populateUI('0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be')

    });


    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                     API data Retrieval                      */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /* Base url for all requests */
    const BASE_URL = 'https://web3api.io/api/v1/'
    const FILTERS = '?page=0&size=50'

    /* Demo key - Get your API Key at amberdata.io/pricing
    * and place yours here! */
    let config = {
        headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
    }

    /**
     * The following methods construct the url and sends it off to axios via the
     * get method.
     * @param address
     */
    let getCurrentTokenBalances = (address) => axios.get(`${BASE_URL}addresses/${address}/tokens`, config)
    let getCurrentTokenTransfers = (address) => axios.get(`${BASE_URL}tokens/${address}/transfers${FILTERS}`, config)
    let getHistoricalTokenBalances = (address, tokenAddress) => axios.get(`${BASE_URL}tokens/${tokenAddress}/holders/historical?timeFrame=30d&holderAddresses=${address}`, config)


    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                        UI Building                          */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /* TODO: the image things is pretty ugly find better sol if possible */
    let getTokenTemplate = (token) =>
        `<div class="token" data-address="${token.address}" data-name="${token.name}">
                <div class="logo item">
                    <img src="https://raw.githubusercontent.com/amberdata/tokens/master/images/${token.address}.png" onerror="if (this.src !== 'error.jpg') this.src = 'https://api2.clovers.network/clovers/svg/${token.address}/128';" alt="">
                </div>
                <div class="name item">
                    ${token.name} (${token.symbol})
                </div>
                <div class="value item">
                    Amount: ${round(getAmount(token), 2)}
                </div>
            </div>`

    let updateTokensList = (tokens, holderAddress) => {
        let tokenList = $('#tokens .list')

        // Remove old list and create new
        tokenList.empty()

        let tokenHtml = `${tokens.map(token => getTokenTemplate(token)).join('')}`
        tokenList.append(tokenHtml)
        if (tokenHtml.length > 5) {
            tokenList.append(`
                <a style="color: #606060; margin:15px; 0"
                   href="https://amberdata.io/addresses/${holderAddress}/portfolio"
                   target="_blank">
                    View all token balances
                </a>`)
        }
    }

    let getTransferTemplate = (transfer) =>
        `<div class="transfer">
            <div class="amount">
                Amount: ${round(getAmount(transfer), 2)}
            </div>
            <div class="hash">
                Hash:  ${truncHash(transfer.transactionHash)}
            </div>
            <div class="view">
                <a href="https://amberdata.io/transactions${transfer.transactionHash}" target="_blank">View ></a>
            </div>
        </div>`

    let updateTransfersList = (transfers) => {
        let transferList = $('#token-transfers .list')

        let transferHtml = `${transfers.map(transfer => getTransferTemplate(transfer)).join('')}`
        transferList.append(transferHtml)

    }

    /**
     * Sends out data requests and updates the UI.
     * @param address the address to obtain data for
     */
    let populateUI = async (address) => {
        if (!isAddress(address)) return // Don't run unless valid ethereum address
        setLoading(true, 'transfers')
        setLoading(true, )
        // TODO: Must be CONCURRENT -: let [balances, transfers] = Promise.all([, ])
        let balances = extractData(await getCurrentTokenBalances(address))
        let sortedBalances = sortBalances(balances.records)
        updateTokensList(sortedBalances, address)

        // Create a map: tokenAddress -> decimals
        let decimals = {}
        sortedBalances.map( (token) => { decimals[token.address] = token.decimals })

        const responses = await Promise.all(sortedBalances.map((token) => getHistoricalTokenBalances(token.holder, token.address)))

        let data = responses.map((response) => extractData(response).data)

        let timeSeriesData = {}
        for(let i = 0; i < data.length; i++) {
            timeSeriesData[sortedBalances[i].address] = data[i].map((token) => {
                token['t'] = new Date(token.timestamp)
                token['y'] = token[address] / Math.pow(10, sortedBalances[i].decimals)
                delete  token.timestamp
                delete  token[address]
                return token
            })
        }

        let tokenElement = $("#tokens .list .token")
        let tokenAddress = tokenElement.data('address')
        let tokenName = tokenElement.data('name')
        let chart = instantiateChart(data[tokenAddress], tokenName)

        console.log(chart)

        /* Attach click handlers to tokens */
        createTokenListener(timeSeriesData, chart)
        tokenElement[0].click()
        setLoading(false)
        let transfers = extractData(await getCurrentTokenTransfers(address))
        updateTransfersList(transfers.records.slice(0, 50))
        setLoading(false, 'transfers')
        return {timeSeriesData, chart}
    }

    let setLoading = (bool, section) => {
        if(section === 'transfers') {
            let loader = $('.loader')

            loader.css('opacity', bool ? '1' : '0')

            loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
                function(e) {
                    loader.css('visibility', bool ? 'visible' : 'hidden')
                    $('#token-transfers .list').css('opacity', bool ? '0': '1')
                });
            if(bool === true) {
                $('#token-transfers .list').empty()
            }
        } else {
            let loader = $('.spinner')

            loader.css('opacity', bool ? '1' : '0')

            loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
                function(e) {
                    loader.css('visibility', bool ? 'visible' : 'hidden')
                    $('.data').css('opacity', bool ? '0': '1')

                });
            $('#tokens .list').css('opacity', bool ? '0': '1')
        }
    }
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                      Charts.js methods                      */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    let updateChart = async (chart, data, tokenName) => {
        chart.data.datasets[0].data = data
        chart.data.datasets[0].label = tokenName
        let imgSrc = $(`*[data-name="${tokenName}"] .logo img`).attr("src")
        let vibrant = await Vibrant.from(imgSrc).getPalette();
        console.log(vibrant)
        let vibRgb = vibrant.Vibrant || vibrant.LightVibrant || vibrant.DarkVibrant || vibrant.Muted || vibrant.LightMuted || vibrant.DarkMuted
        let muteRgb = vibrant.Muted || vibrant.LightMuted  || vibrant.DarkMuted || vibrant.DarkVibrant || vibrant.LightVibrant || vibrant.Vibrant

        chart.data.datasets[0].borderColor = `rgba(${vibRgb.get()[0]}, ${vibRgb.get()[1]}, ${vibRgb.get()[2]}, 1)`
        chart.data.datasets[0].backgroundColor = `rgba(${muteRgb.get()[0]}, ${muteRgb.get()[1]}, ${muteRgb.get()[2]}, 0.2)`


        chart.update();
    }

    let instantiateChart = (data) => {
        Chart.defaults.global.defaultFontColor = 'white';
        let ctx = $('#holdings-chart')
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Number of Tokens',
                    data: data,
                    backgroundColor: 'rgba(107, 107, 107, 0.2)',
                    borderColor: 'rgba(107, 107, 107, 1)',
                    fill: true,
                }]
            },
            options: {
                title: {
                    display: true,
                    text: ''
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        ticks: {
                            autoSkip: true
                        },
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            color: ['white']
                        },
                        scaleLabel: {
                            display: true,
                        }
                    }],
                    yAxes: [{
                        display: true,
                        gridLines: {
                            drawBorder: false,
                            display: false,
                            color: ['white']
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Tokens'
                        }
                    }]
                },
                tooltips: {
                    intersect: false,
                    mode: 'index',
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    callbacks: {
                        label: (tooltipItem, data) => {
                            let label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += round(tooltipItem.yLabel, 2);
                            return label;
                        }
                    }
                }
            }
        });
    }

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                          Listeners                          */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /* Text Input listener
     * Watches the input field and will initiate search after an
     * address is entered.
     */
    let textInput = document.getElementById('address-input-field');
    let timeout = null; // Init a timeout variable to be used below
    textInput.onkeyup = (e) => {  // Listen for keystroke events

        // Clear the timeout if it has already been set.
        // This will prevent the previous task from executing
        // if it has been less than <MILLISECONDS>
        clearTimeout(timeout);

        // Make a new timeout set to go off in 800ms
        timeout = setTimeout(async () => {
            await populateUI(textInput.value.toLowerCase());
        }, 500);
    };

    /**
     * Creates and attaches listener onto the token elements. Triggers
     * updates to the chart upon token selection.
     * @param histHoldings contains time series historical token hodlings
     * @param chart reference to the chart.js instance
     * @return {void | jQuery}
     */
    let createTokenListener = (histHoldings, chart) =>
    $("#tokens .list .token").click(function () {
        if(!$(this).is($('.selected'))) {
            $(this).siblings('.selected').toggleClass('selected')
            $(this).toggleClass('selected')
            let tokenAddress = $(this).data('address')
            let tokenName = $(this).data('name')
            console.log('selected token: ', tokenAddress)
            //TODO: Error handling
            console.log('selected tokens data: ', histHoldings[tokenAddress])
            updateChart(chart, histHoldings[tokenAddress], tokenName)
        }
    });


    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                      Helper methods                         */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    let getAmount = (token) => token.amount / Math.pow(10, token.decimals)

    let truncHash = (hash) => `${hash.slice(0,10)}...`

    let round = (n, digits) => Number.parseFloat(n).toFixed(digits)

    /* Get's to the data we want. Makes things clearer.*/
    let extractData = (data) => data.data.payload

    /* Renames an objects keys */
    let renameKeys = (keysMap, obj) => Object
        .keys(obj)
        .reduce((acc, key) => ({
            ...acc,
            ...{[keysMap[key] || key]: obj[key]}
        }), {});

    /**
     * Returns sorted list of token balances
     * @param balances
     * @return {Int16Array}
     */
    let sortBalances = (balances) =>
        balances.sort((a, b) => {
            if (getAmount(a) > getAmount(b))
                return -1
            if (getAmount(a) < getAmount(b))
                return 1
            return 0
        }).slice(0, 5) // Limit top 5 results

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
        address = address.replace('0x', '');
        var addressHash = sha3(address.toLowerCase());
        for (var i = 0; i < 40; i++) {
            // the nth letter should be uppercase if the nth digit of casemap is 1
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    };

}));