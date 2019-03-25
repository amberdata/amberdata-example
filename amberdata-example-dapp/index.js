// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {
        await populateUI('0x06012c8cf97bead5deae237070f9587f8e7a266d')
    });


    /* Base url for all requests */
    const BASE_URL = 'https://web3api.io/api/v1/'
    const FILTERS = '?page=0&size=50'

    let config = {
        headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
    }

    /**
     * The following methods construct the url and sends it off to axios via the
     * get method.
     * @param address
     */
    let getAddressInformation = (address) => axios.get(`${BASE_URL}addresses/${address}/information`, config)
    let getContractFunctions = (address) => axios.get(`${BASE_URL}contracts/${address}/functions`, config)
    let getAddressTransactions = (address) => axios.get(`${BASE_URL}addresses/${address}/transactions${FILTERS}`, config)
    let getAddressFunctions = (address) => axios.get(`${BASE_URL}addresses/${address}/functions${FILTERS}`, config)
    let getAddressLogs = (address) => axios.get(`${BASE_URL}addresses/${address}/logs${FILTERS}`, config)

    /**
     * Gets address information and determines if the address is EOA or Contract
     * then returns results the result as presentable string
     * @param address
     * @return {Promise<string>} the type of address 'EOA' or 'Contract'
     */
    let getAddressType = async (address) => {
        let addressInfo = extractData(await getAddressInformation(address))
        setFirstSeen(addressInfo[0].firstSeen)
        return addressInfo[0].type === 'contract' ? 'Contract' : 'EOA'
    }

    let buildActivityFeed = (activities) =>
        activities.sort((a, b) => {
            if (a.timestamp > b.timestamp)
                return -1
            if (a.timestamp < b.timestamp)
                return 1
            return 0
        }).slice(0, 50) // Limit 50 results

    let entryTemplate = ({icon = '', detail = '', hash = '', link = ''}) =>
        `<div class="entry">
            <div class="icon item">
                <p>${icon}</p>
            </div>
            <div class="detail item">
                ${detail}
            </div>
            <div class="hash item">
                Hash: ${truncHash(hash, 10)}
            </div>
            <div class="view item">
                <a href="${link}" target="_blank">View ></a>
            </div>
         </div>`

    let getMethodName = (fourByteSig, contractMethods) => fourByteSig in contractMethods ? contractMethods[fourByteSig] : fourByteSig

    let getEntryData = (entry, contractMethods) => {
        const AMBERDATA_BASE_URL = 'https://amberdata.io/'
        switch (entry.type) {
            case TRANSACTION: return {
                icon: 'TXN',
                detail: `Value: ${toEth(entry.value)} Ether`,
                hash: truncHash(entry.hash,10),
                link: `${AMBERDATA_BASE_URL}transactions/${entry.hash}`
            }
            case FUNCTION: return {
                icon: 'IM',
                detail: `${truncHash(getMethodName(entry.input.slice(0,10), contractMethods),20)}`,
                hash: truncHash(entry.transactionHash,10),
                link: `${AMBERDATA_BASE_URL}functions/${entry.transactionHash}`
            }
            case LOG: return {
                icon: 'LOG',
                detail: `Input: ${truncHash(entry.topics ? entry.topics[0] : entry.data[0], 10)}`,
                hash: truncHash(entry.transactionHash,10),
                link: `${AMBERDATA_BASE_URL}logs/${entry.transactionHash}`
            }
        }
    }

    let updateActivitiesList = ({ activities, contractMethods = {} }) => {
        // TODO:L Might need to delete old entries here?
        let entries = `${activities.map(entry => entryTemplate({...getEntryData(entry, contractMethods)})).join('')}`
        $('#activity .list').append(entries)
    }

    const TRANSACTION = 0, FUNCTION = 1, LOG = 2

    /**
     * Updates the UI with all of the data
     * @param address the address to obtain data for
     */
    let populateUI = async (address) => {
        if(!isAddress(address)) return

        setLoading(true, 'card')
        setLoading(true, 'activity')
        let addressType = await getAddressType(address)
        setAddress(address)
        setAddressType(addressType)
        setAddresslink(address)

        setLoading(false, 'card')

        let responses = await Promise.all([getAddressTransactions(address), getAddressFunctions(address), getAddressLogs(address)])
        // 0xf4faea455575354d2699bc209b0a65ca99f69982
        responses = responses.filter(result => !(result instanceof Error));

        // TODO: This is dangerous -- records might not exist
        let data = responses.map( (resp) => extractData(resp).records)

        data[TRANSACTION].map( (txn) => txn['type'] = TRANSACTION)
        data[FUNCTION].map( (txn) => txn['type'] = FUNCTION)
        data[LOG].map( (txn) => txn['type'] = LOG)

        let activities = buildActivityFeed([].concat.apply([], data))

        let contractMethods = {}
        if (addressType === 'Contract') {
            let functions = extractData(await getContractFunctions(address))
            functions.map( (func) => {
                if('hexadecimalSignature' in func) {
                    contractMethods[func.hexadecimalSignature] = func.textSignature
                }
            })

            updateActivitiesList({ activities, contractMethods })
            setLoading(false, 'activity')
        } else {
            updateActivitiesList({ activities })
            setLoading(false, 'activity')
        }

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

    let setLoading = (bool, section) => {
        if(section === 'card') {
            let loader = $('.spinner')
            loader.css('opacity', bool ? '1' : '0')
            loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
                (e) => {
                    loader.css('visibility', bool ? 'visible' : 'hidden')
                    $('.data').css('opacity', bool ? '0': '1')
                });
        } else {
            let loader = $('.loader')

            loader.css('opacity', bool ? '1' : '0')

            loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
                (e) => {
                    loader.css('visibility', bool ? 'visible' : 'hidden')
                    $('#activity .list').css('opacity', bool ? '0': '1')
                });
        }
    }

    let setAddress = (address) => $('#address').text(address)

    let setAddresslink = (address) => $('#address-link').attr('href', `https://amberdata.io/addresses/${address}`)

    let setAddressType = (type) => $('#address-type').text(type)

    let setFirstSeen = (firstSeen) =>  {
            let date = new Date(firstSeen)
            let localTime = date.toLocaleTimeString().split(' ')[0].slice(0,-3)
            let period = date.toLocaleTimeString().split(' ')[1].toLowerCase()
            let dateString = date.toLocaleDateString()
            $('#date').text(`First Seen: ${localTime}${period} - ${dateString}`)
    }

    /* Returns truncated hash for displaying */
    let truncHash = (hash, n) => `${hash.slice(0,n)}...`

    let toEth = (wei) => wei / 1000000000000000000

    /* Get's to the data we want. Makes things clearer.*/
    let extractData = (data) => data.data.payload

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
