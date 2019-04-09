// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {

        populateUI()
    });

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                     API data Retrieval                      */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /* Base url for all requests */
    const BASE_URL = 'https://web3api.io/api/v1'
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
    let getTopTokensMarketCap = () => axios.get(`${BASE_URL}/tokens/rankings?direction=descending&sortType=marketCap&timeInterval=d`, config)
    let getTopTokensChangeInPrice = () => axios.get(`${BASE_URL}/tokens/rankings?direction=descending&sortType=changeInPrice&timeInterval=d`, config)
    let getTopNFTs = () => axios.get(`${BASE_URL}/tokens/rankings?sortType=transactionVolume&type=erc721&timeInterval=d`, config)

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                        UI Building                          */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    const getVolumeTemplate = (entry) => `
            <div class="volume item" data-volume="${entry.transactionVolume}">
               <p>${entry.transactionVolume || '-'}</p>
            </div>`

    const getUniquesTemplate = (entry) => `
        <div class="uniques item" data-uniques="${entry.uniqueAddresses}">
            <p>${entry.uniqueAddresses || '-'}</p>
        </div>`

    const getPriceTemplate = (entry) => {
        const price = entry.currentPrice
        const change = entry.changeInPrice
        const percentChange = round(change, 2)

        return `<div class="price item" data-price="${entry.currentPrice}">
                    <div class="current">$${round(price, 2)}</div>
                    <div style="color: ${percentChange > 0 ? '#6CA763' : '#BA5C5C'}" class="delta">
                    <img src="assets/arrow-${percentChange > 0 ? 'up' : 'down'}-b.svg" alt="">
                    <p>${`${Math.abs(percentChange)}`.padEnd(4, '0')}%</p>
                    </div>
               </div>`
    }

    const getMarketCapTemplate = (entry) => `
            <div class="cap-vol item" data-cap="${entry.marketCap}">
                <div class="cap">${formatNumber(entry.marketCap)}</div>
                 <div class="volume">${formatNumber(entry.currentPrice * entry.transactionVolume)}</div>
            </div>`

    let getEntryTemplate = (entry, i) => `
           <a href="https://amberdata.io/addresses/${entry.address}" target="_blank">
           <div class="entry ${ i === 0 ? 'white' : 'light-grey'}">
                <div class="logo">
                    <img src="https://raw.githubusercontent.com/amberdata/tokens/master/images/${entry.address}.png" onerror="if (this.src !== 'error.jpg') this.src = 'https://api2.clovers.network/clovers/svg/${entry.address}/128';" alt="">
                </div>
                <div class="name item">
                    <div class="full">
                        ${ entry.name ? entry.name.replace(/[<>]/g, '') : '-'}
                    </div>
                    <div class="symbol">
                        ${entry.symbol ? entry.symbol.replace(/[<>]/g, '') : '-'}
                    </div>
                </div>
                ${ entry.isERC721 ? getVolumeTemplate(entry) :  getPriceTemplate(entry)  }
                ${ entry.isERC721 ? getUniquesTemplate(entry) : getMarketCapTemplate(entry)}
            </div>
            </a>
    `

    let updateDataTable = (entries) => {
        const dataTable = $('#data-table .list')

        dataTable.css('visibility', 'hidden')
        dataTable.css('opacity', '0')

        console.log(dataTable.css('opacity'))
        /* Check if table already has entries */
        if (dataTable.children().length > 0) {
            dataTable.empty()
        }

        let entryHtml = `${entries.map( (entry, index) => {
                
                return getEntryTemplate(entry, index % 2)
            }
        ).join('')}`

        dataTable.append(entryHtml)

        dataTable.css('visibility', 'visible')
        dataTable.css('opacity', '1')
    }

    const updateColumnNames = (columnData) => {
        const columns = $('.col-name')
        columnData.map( (data, index) => {
            columns.eq(index).find('p').text(data.text)
            columns.eq(index).data('name', data.dataAttr)
            columns.eq(index).data('dir', 'asc')
        })
    }

    let populateUI = async () => {
        // const tokensMarketCap = extractData(await getTopTokensMarketCap())

        const viewData = {cap: null, price: null, nft: null}

        // viewData.cap = tokensMarketCap.data

        // createViewListeners(viewData)

        // $('.view')[0].click()

        const responses = await Promise.all([getTopTokensMarketCap(), getTopTokensChangeInPrice(), getTopNFTs()])
        let data = responses.map((response) => extractData(response).data)
        viewData.cap = data[0]
        viewData.price = data[1]
        viewData.nft = data[2]
        createViewListeners(viewData)
        $('.view')[0].click()
        createSortByListeners(viewData)
    }

    const filterBadData = (data) => {

    }

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                       Helper methods                        */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /**
     * Takes in a raw number e.g. 8391030.20183, rounds, truncates and formats
     * as: 8.39M.
     * @param number
     * @return {string}
     */
    let formatNumber = (number) => {
        let formattedNumber = number
        if (formattedNumber >= 1000) {
            formattedNumber = round(formattedNumber, 0)
            len = Math.ceil(Math.log10(formattedNumber))
            nSigFigs = (len - 1) % 3 + 3
            formattedNumber = formattedNumber.slice(0, nSigFigs + 1)
            formattedNumber = Math.round(formattedNumber / 10)
            formattedNumber = formattedNumber / 100
            formattedNumber = '$' + formattedNumber + `${len > 9 ? 'B' : len > 6 ? 'M' : 'K'}`
        } else {
            formattedNumber = '$' + round(formattedNumber, 2)
        }
        return formattedNumber
    }

    let selectView = (view, viewData) => {

        if (view.hasClass('selected')) {
            console.log('view selected -> ', view.data('view'))
            return
        }

        $('#data-views').find('.selected').toggleClass('selected')

        view.toggleClass('selected')

        const chip = $('#chip')

        chip.height(view.outerHeight(true))
        chip.width(view.outerWidth(true))

        // .position() uses position relative to the offset parent,
        const pos = view.position();

        // .outerWidth() takes into account border and padding.
        const width = view.outerWidth();

        //show the menu directly over the placeholder
        chip.css({
            position: "absolute",
            transform: `translateX(${pos.left}px) translateY(-50%)`
        })
        const viewName = view.data('view')

        const columnData = {
            allTokens: [
                {text: 'RANK', dataAttr: ''},
                {text: 'PRICE', dataAttr: 'price'},
                {text: 'CAP / VOL', dataAttr: 'cap'}
            ],
            NFTs: [
                {text: 'RANK', dataAttr: ''},
                {text: 'TXN VOLUME', dataAttr: 'volume'},
                {text: 'UNIQUES', dataAttr: 'uniques'}
            ]
        }

        switch (viewName) {
            case 'cap':
                updateColumnNames(columnData.allTokens)
                updateDataTable(viewData[viewName]);
                console.log('selected view', viewName)
                break;
            case 'price':
                updateColumnNames(columnData.allTokens)
                updateDataTable(viewData[viewName]);
                console.log('selected view', viewName)
                break;
            case 'nft':
                updateColumnNames(columnData.NFTs)
                updateDataTable(viewData[viewName]);
                console.log('selected view', viewName)
                break;
        }
    }

    const sortEntries = (col, viewData) => {
        const name = col.data('name')
        const dir = col.data('dir')
        const viewName = $('#data-views').find('.selected').data('view')

        // No name no sort ability
        if (!name) return

        // const dataTable = $('#data-table .list')
        let sortType
        switch (name) {
            case 'price': sortType = 'currentPrice'; break;
            case 'cap': sortType = 'marketCap'; break;
            case 'volume': sortType = 'transactionVolume'; break;
            case 'uniques': sortType = 'uniqueAddresses'; break;
        }
        const sortedData = sortBy(viewData[viewName], sortType, dir)
        console.log(sortedData)
        col.data('dir', dir === 'asc' ? 'desc' : 'asc')

        updateDataTable(sortedData)

        // dataTable.empty()
        // dataTable.append(sortedEntries)

    }
    let sortBy = (data, sortType, dir) =>
        data.sort((a, b) => {
            if (parseFloat(a[sortType]) > parseFloat(b[sortType]))
                return dir === 'asc' ? -1 : 1
            if (parseFloat(a[sortType]) < parseFloat(b[sortType]))
                return dir === 'asc' ? 1 : -1
            return 0
        })

    let getDataValue = (entry, type) => $(entry).find(`[data-${type}]`).data(`${type}`)

    /* Get's to the data we want. Makes things clearer.*/
    let extractData = (data) => data.data.payload

    let round = (n, digits) => Number.parseFloat(n).toFixed(digits)

    let calcPercentChange = (previous, current) => {
        return ( (current - previous) / previous ) * 100
    }

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /*                          Listeners                          */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    let createViewListeners = (viewData) => {
        /* Loads up the UI with a default address */
        $('.view').click( function() {
            selectView($(this), viewData)
        })
    }

    let createSortByListeners = (viewData) => {
        $('.col-name').click( function() {
            $(this).find('img').toggleClass('rotate')
            sortEntries($(this), viewData)
        })
    }

}));