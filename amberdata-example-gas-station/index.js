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

        /*
         * Percentile increments based on the /transactions/gas/percentiles
         * endpoint. Used to create the initial increments as seen in
         * the graph on the Gas Percentiles card
         */
        let percentileIncrements = [
            0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65,
            70, 75, 80, 85, 90, 95, 96, 97, 98, 99, 100,
        ]

        /* Dynamically creates the html that displays the percentile graph */
        createGasPercentilesHtml(percentileIncrements)

        /* Main method that gets data and updates the UI */
        await populateUI()
    });

    console.log('The DOM may not be ready');

    /**** Helper methods ****/

    /* rounds a number to n digits */
    let round = (n, digits) => Number.parseFloat(n).toFixed(digits)

    /* Get's to the data we want. Makes things clearer.*/
    let extractData = (data) => data.data.payload

    let toGwei = (wei) => wei / 1000000000

    let calculateBarHeights = (percentiles) => {
        let prices = Object.values(percentiles)
        let maxGasPrice = Math.max(...prices)
        // x * 92 / 100 + 8
        return prices.map(price => round((price / maxGasPrice * 100) * (92/100) + 8), 0);
    }

    let setLoading = (bool) => {

        let loader = $('.spinner')

        loader.css('opacity', bool ? '1' : '0')

        loader.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
            function(e) {
                loader.css('visibility', bool ? 'visible' : 'hidden')
                $('#gas-predictions .card-content').css('opacity', bool ? '0': '1')
            });
    }

    let populateUI = async () => {
        setLoading(true)
        let predictions = extractData(await getGasPredictions())
        updatePredictions(predictions)

        let percentiles = extractData(await getGasPercentiles())
        let barHeights = calculateBarHeights(percentiles); console.log(barHeights)
        updatePercentiles(Object.entries(percentiles), barHeights)
        setLoading(false)
    }

    let updatePredictions = (predictions) => {
        $('#fast .price .value').text(toGwei(predictions.fast.gasPrice))
        $('#medium .price .value').text(toGwei(predictions.average.gasPrice))
        $('#slow .price .value').text(toGwei(predictions.safeLow.gasPrice))
    }

    let getGasPredictions = async () => {
        return await axios({
            method:'get',
            url: 'https://web3api.io/api/v1/transactions/gas/predictions',
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }

    let updatePercentiles = (percentiles, barHeights) => {

        $('#gas-percentiles .bar').each( (i, el) => {
            $( el ).css('max-height', `${barHeights[i]}px`)
            let gasPrice = round(toGwei(percentiles[i][1]), 2)
            let percentile = parseInt(percentiles[i][0].split('_')[1])
            $( el ).children(0).text(`Gas Price: ${gasPrice} \n Percentile: ${percentile} \n`)
        });
    }

    let getGasPercentiles = async () => {
        // TODO: Handle response errors
        return await axios({
            method:'get',
            url: 'https://web3api.io/api/v1/transactions/gas/percentiles',
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }

    let createGasPercentilesHtml = (array) => {

        /* Html templates for bars and percent labels*/
        let bars = `${array.map(() => `<div class="bar"><span class="details-bubble"></span></div>`).join('')}`
        let percents = `${array.map(percent => `<div class="percent">${percent}</div>`).join('')}`

        let gasPercentileElement =  $('#gas-percentiles .card-content')
        gasPercentileElement.append(bars)
        gasPercentileElement.append(percents)

    }
}));
