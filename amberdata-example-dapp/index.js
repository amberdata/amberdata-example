// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function () {
        // TODO: REMOVE WHEN DONE - 0x0b44611b8ae632be05f24ffe64651f050402ae01
        await populateUI('0x06012c8cf97bead5deae237070f9587f8e7a266d')
        // createInputListener()
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
    let getContractFunctions = (address) => axios.get(`${BASE_URL}contracts/${address}/abi`, config)

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
        }).slice(0, 50)

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
                <a href="https://amberdata.io/${link}" target="_blank">View ></a>
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
        let entries = `${activities.map(entry => entryTemplate({...getEntryData(entry, contractMethods)})).join('')}`
        $('#activity .list-wrapper .list').append(entries)
    }

    const TRANSACTION = 0, FUNCTION = 1, LOG = 2
    /**
     * Updates the UI with all of the data
     * @param address the address to obtain data for
     */
    let populateUI = async (address) => {

        let addressType = await getAddressType(address)
        setAddress(address)
        setAddressType(addressType)
        setAddresslink(address)

        // ASK: About efficiency -- context why type is necessary
        // ASK: About clarity
        // TODO:COMMENT THOROUGHLY
        let responses = await axios.all([getAddressTransactions(address), getAddressFunctions(address), getAddressLogs(address)])

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
        } else {
            updateActivitiesList({ activities })
        }

    }



    /**
     * Watches the input field and will initiate search after an
     * address is entered.
     */

        // Get the input box
    let textInput = document.getElementById('address-input-field');

    // Init a timeout variable to be used below
    let timeout = null;

    // Listen for keystroke events
    textInput.onkeyup = (e) => {

        // Clear the timeout if it has already been set.
        // This will prevent the previous task from executing
        // if it has been less than <MILLISECONDS>
        clearTimeout(timeout);

        // Make a new timeout set to go off in 800ms
        timeout = setTimeout(async () => {
            await populateUI(textInput.value.toLowerCase());
        }, 500);
    };

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

    //TODO REMOVE WHEN DONE:
    let l = (message) => console.log('I shouldn\'t be here if in prod\n\n', message)

    // TODO: add address check sum

}));
