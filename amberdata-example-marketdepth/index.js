// IIFE - Immediately Invoked Function Expression
(function (code) {

    // The global jQuery object is passed as a parameter
    code(window.jQuery, window, document);

}(function ($, window, document) {

    // The $ is now locally scoped

    // Listen for the jQuery ready event on the document
    $(async function (format, data) {

        console.log('The DOM is ready');

    });

    /* Text Input listener
     * Watches the input field and will initiate search after an
     * address is entered.
     */
    let textInput = document.getElementById('api-key-input');
    let timeout = null; // Init a timeout variable to be used below
    textInput.onkeyup = (e) => {  // Listen for keystroke events

        // Clear the timeout if it has already been set.
        // This will prevent the previous task from executing
        // if it has been less than <MILLISECONDS>
        clearTimeout(timeout);

        // Make a new timeout set to go off in 800ms
        timeout = setTimeout(async () => {
            await initAll(textInput.value);
        }, 500);
    };

    const initAll = async (api_key) => {
        await initCharts(api_key)
        initWebSockets(new DataHandler(window.data), api_key)
    }

    const getHistoricalOHLCV = (pair, api_key) => axios.get(`https://web3api.io/api/v1/market/ohlcv/${pair}/historical`, {
        headers: {"x-api-key": api_key}
    })

    let hasReceivedData = false


    const initWebSockets = (dataHandler, api_key) => {

        // Create WebSocket connection.
        /*const socket = new WebSocket(`wss://ws.web3api.io?x-api-key=${api_key}`);
        const pair = "eth_btc"

        // Connection opened
        socket.addEventListener('open', function (event) {
            console.log('Connection opened - ', event);

            socket.send(`{"jsonrpc":"2.0","id":0,"method":"subscribe","params":["market:orders",{"pair":"${pair}","exchange":"gdax"}]}`);

            setTimeout(() => {
                if(!hasReceivedData)
                    socket.send(`{"jsonrpc":"2.0","id":0,"method":"subscribe","params":["market:orders",{"pair":"${pair}","exchange":"gdax"}]}`);
            }, 5000)
        });

        // Listen for messages
        socket.addEventListener('message', (wsEvent) => _responseHandler(wsEvent, dataHandler));

        // Listen for messages
        socket.addEventListener('close', function (event) {
            console.log('Connection closed - ', event);
            initWebSockets(dataHandler)
        });*/

        const w3d = new Web3Data(api_key)
        console.log(w3d)
        w3d.connect()
        w3d.on({eventName: 'market:orders', filters: {"pair": "eth_btc", "exchange":"gdax"}}, (_order, order = _order[0] ) => _responseHandler(order, dataHandler))
    }

    const extractData = (data) => data.data.payload

    const _responseHandler = (order, dataHandler) => {


        const point = new Point(order)
        console.log( 'order - - - ', order )
        console.log( 'point - - - ', point )
        // check if bid is in asks or if aｓk in bids
        // point.isBid ? dataHandler.inAsks(point) : dataHandler.inBids(point)

        const pointExists = dataHandler.pointExists(point)

        if(point.isBid && dataHandler.inAsks(point) || !point.isBid && dataHandler.inBids(point)) {
            dataHandler.matchPoint(point)
        } else if(pointExists && point.volume > 0) {
            dataHandler.updatePoint(point)
        } else if(pointExists && point.volume === 0) {
            dataHandler.removePoint(point)
        } else if(!pointExists) {
            dataHandler.addPoint(point)
            // console.log(`no exist`, point)
        } else {
            console.log(`no exist`, point)
        }
        window.chart.data = dataHandler.getDataArray()
        window.chart.invalidateData();


    }

    /**
     * Returns true if the websocket message is a subscription response
     * as seen here: docs.amberdata.io/reference/subscriptions#section-example-
     * @param msg the websocket response method
     * @return {boolean}
     */
    const isSubscriptionAck = msg => !msg.params

    class Point {
        constructor(dataArray) {
            this.price = dataArray[3]
            this.volume = dataArray[4]
            this.isBid = dataArray[5]
            this.totalvolume = 0
            this.type = this.isBid ? 'bids' : 'asks'
        }
        toJSON() {
            return {value: this.price, [`${this.type}volume`]: this.volume, [`${this.type}totalvolume`]: this.totalvolume}
        }
    }

    class DataHandler {

        constructor(dataArray) {
            // Init inital list
            this.dataArray = dataArray.map( entry => [entry.value, entry])
            this.bids = new SortedMap(this.dataArray.slice(0,50))
            this.asks = new SortedMap(this.dataArray.slice(50,100))
        }

        pointExists(point) {
            return point.isBid ? this.bids.has(point.price) : this.asks.has(point.price)
        }

        inAsks(point) {
            return this.asks.has(point.price)
        }

        inBids(point) {
            return this.bids.has(point.price)
        }

        pointMatch(point) {
            return this.bids.has(point.price) && this.asks.has(point.price)
        }

        matchPoint(pointToMatch) {
            // get the matching point
            const matchingPoint = this._getDataSet(!pointToMatch.isBid).get(pointToMatch.price)

            // if points are equal then...
            if(pointToMatch.volume === matchingPoint.volume) {

                // remove the matching point and don't add the new point (pointToMatch)
                this.removePoint(matchingPoint)
            } else if(pointToMatch.volume < matchingPoint.volume) {
                // don't add the new point (pointToMatch) since it is "consumed" (full-filled)
                // set the matching points volume to the difference of the new points volume
                matchingPoint.volume -= pointToMatch.volume

                // update the culm vol of the matching point's dataset
                this.updatePoint(matchingPoint)
            } else if(pointToMatch.volume > matchingPoint.volume) {
                // remove the matching point since it gets "consumed" (full-filled)
                this.removePoint(matchingPoint)

                // set the new points volume to the difference of the matching points volume
                pointToMatch.volume -= matchingPoint.volume

                // add the new point
                this.addPoint(pointToMatch)
            }
            // remove matchingPoint point

            // update both culm vol using value = pointToMatch.volume

            /*

            volA - volB < 0

           */

            // if bid < a$k
            // remove the bid update culm vol using value =

            // bid > a$k




        }

        updatePoint(pointToUpdate) {
            // get reference to the data set: bids or asks
            const dataSet = this._getDataSet(pointToUpdate.isBid)

            // Get the current point state before it's updated
            const currentPoint = dataSet.get(pointToUpdate.price)

            // Get the current Point's volume
            // ( volume is at index 1 -> [<price>, <volume>, <totalvolume> ])
            const currentPointVolume = Object.values(currentPoint)[1]

            const volumeDifference = pointToUpdate.volume - currentPointVolume


            currentPoint[`${pointToUpdate.type}volume`] = pointToUpdate.volume
            dataSet.set(pointToUpdate.price, currentPoint)
            this._updateCulmVol(dataSet, this._indexOf(pointToUpdate), pointToUpdate.isBid, volumeDifference)
        }

        addPoint(point) {
            // get reference to the data set: bids or asks
            const dataSet = this._getDataSet(point.isBid)

            dataSet.set(point.price, point.toJSON())

            const dataArray = dataSet.toArray()
            const pIndex = this._indexOf(point)
            const op = this._getOperation(!point.isBid)
            const adjcentPoint = dataArray[op(pIndex, 1)]

            // If adding to the 'inner' most index, point.totalvolume === point.volume
            point.totalvolume = adjcentPoint ? adjcentPoint[`${point.type}totalvolume`] : 0
            dataSet.set(point.price, point.toJSON())
            this._updateCulmVol(dataSet, this._indexOf(point), point.isBid, point.volume)
        }

        removePoint(pointToRemove) {
            // get reference to the data set: bids or asks
            const dataSet = this._getDataSet(pointToRemove.isBid)

            const _point = dataSet.get(pointToRemove.price)
            const volume = Object.values(_point)[1]
            const totalvolume = Object.values(_point)[2]

            const index = this._indexOf(pointToRemove)
            dataSet.delete(pointToRemove.price)

            this._updateCulmVol(dataSet, pointToRemove.isBid ? index - 1 : index, pointToRemove.isBid, totalvolume > 0 ? - volume : 0)
        }

        getDataArray() {
            return  [...this.bids.values(), ...this.asks.values()]
        }

        _updateCulmVol(dataSet, index, isBid, value) {
            const op = this._getOperation(isBid)
            const comp = this._getComparison(isBid)
            const end = isBid ? -1 : dataSet.length
            const dataArray = dataSet.toArray()

            // get the string name of the set
            const type = isBid ? 'bids' : 'asks'
            if(value < 0 && isBid) {
                console.log()
            }

            for(let i = index; comp(i, end); i = op(i, 1)) {
                const data = dataArray[i]
                if (data[`${type}totalvolume`] + value < 0) {
                    console.log('wtf')
                }
                data[`${type}totalvolume`] += value
                dataSet.set(dataArray[i].value, data)

            }
        }

        _getComparison(isBid) {
            const gt = (a, b) => a > b
            const lt = (a, b) => a < b
            return isBid ? gt : lt
        }

        _getOperation(isBid) {
            const add = (a, b) =>  a + b
            const sub = (a, b) => a - b
            return isBid ? sub : add
        }

        _getDataSet(isBid) {
            return isBid ? this.bids : this.asks
        }

        _indexOf(point) {
            let keys = [...this._getDataSet(point.isBid).keys()]
            return keys.indexOf(point.price)
        }
    }


    const initCharts = async (api_key) => {

        $('#overlay').css('opacity', '.5')
        $('.loader').css('opacity', '1');
        am4core.ready(function() {

            // Themes begin
            // am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("chart--depth", am4charts.XYChart);

            // Add data
            chart.dataSource.requestOptions.requestHeaders = [{
                "key": "x-api-key",
                "value": api_key
            }];
            chart.dataSource.url = `https://web3api.io/api/v1/market/orders/eth_btc?exchange=gdax&timestamp=${new Date().getTime() - 3600000.00}`;
            chart.dataSource.adapter.add("parsedData", function(data) {

                // Function to process (sort and calculate cumulative volume)
                function processData(list, type, desc) {
                    // Convert to data points
                    for(var i = 0; i < list.length; i++) {
                        list[i] = {
                            value: Number(list[i][0]),
                            volume: Number(list[i][1]),
                        }
                    }

                    // Sort list just in case
                    list.sort(function(a, b) {
                        if (a.value > b.value) {
                            return 1;
                        }
                        else if (a.value < b.value) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    });

                    // Calculate cummulative volume
                    if (desc) {
                        for(var i = list.length - 1; i >= 0; i--) {
                            if (i < (list.length - 1)) {
                                list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
                            }
                            else {
                                list[i].totalvolume = list[i].volume;
                            }
                            var dp = {};
                            dp["value"] = list[i].value;
                            dp[type + "volume"] = list[i].volume;
                            dp[type + "totalvolume"] = list[i].totalvolume;
                            res.unshift(dp);
                        }
                    }
                    else {
                        for(var i = 0; i < list.length; i++) {
                            if (i > 0) {
                                list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
                            }
                            else {
                                list[i].totalvolume = list[i].volume;
                            }
                            var dp = {};
                            dp["value"] = list[i].value;
                            dp[type + "volume"] = list[i].volume;
                            dp[type + "totalvolume"] = list[i].totalvolume;
                            res.push(dp);
                        }
                    }
                }


                // Init
                var res = [];
                console.log(data.payload.data)
                processData(data.payload.data.bid, "bids", true);
                processData(data.payload.data.ask, "asks", false);

                window.data = res
                return res;
            });

            // Set up precision for numbers
            chart.numberFormatter.numberFormat = "#,###.####";

            // Create axes
            var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            xAxis.dataFields.category = "value";
            //xAxis.renderer.grid.template.location = 0;
            xAxis.renderer.minGridDistance = 50;
            xAxis.title.text = "Price (ETH/BTC)";
            // xAxis.interpolationDuration = 500;

            var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
            yAxis.title.text = "Volume";
            // yAxis.interpolationDuration = 500;

            // Create series
            var series = chart.series.push(new am4charts.StepLineSeries());
            series.dataFields.categoryX = "value";
            series.dataFields.valueY = "bidstotalvolume";
            series.strokeWidth = 2;
            series.stroke = am4core.color("#0f0");
            series.fill = series.stroke;
            series.fillOpacity = 0.1;
            series.tooltipText = "Bid: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{bidsvolume}[/]"
            // series.interpolationDuration = 500;

            var series2 = chart.series.push(new am4charts.StepLineSeries());
            series2.dataFields.categoryX = "value";
            series2.dataFields.valueY = "askstotalvolume";
            series2.strokeWidth = 2;
            series2.stroke = am4core.color("#f00");
            series2.fill = series2.stroke;
            series2.fillOpacity = 0.1;
            series2.tooltipText = "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{asksvolume}[/]"
            // series2.interpolationDuration = 500;

            var series3 = chart.series.push(new am4charts.ColumnSeries());
            series3.dataFields.categoryX = "value";
            series3.dataFields.valueY = "bidsvolume";
            series3.strokeWidth = 0;
            series3.fill = am4core.color("#000");
            series3.fillOpacity = 0.2;
            // series3.interpolationDuration = 500;

            var series4 = chart.series.push(new am4charts.ColumnSeries());
            series4.dataFields.categoryX = "value";
            series4.dataFields.valueY = "asksvolume";
            series4.strokeWidth = 0;
            series4.fill = am4core.color("#000");
            series4.fillOpacity = 0.2;
            // series4.interpolationDuration = 500;

            // Add cursor
            chart.cursor = new am4charts.XYCursor();
            window.chart = chart
        }); // end am4core.ready()



        let data

        try {
            data = extractData(await getHistoricalOHLCV('eth_btc', api_key)).data
        } catch (e) {
            console.error(`Error with request most likely caused by invalid api key`, e)
            $('.loader').css('opacity', '0')
            $('#overlay').css('opacity', '0')
        }


        // split the data set into ohlc and volume
        var ohlc = [],
            volume = [],
            dataLength = data.bitfinex.length,
            // set the allowed units for data grouping
            groupingUnits = [[
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]],
            i = 0;

        for (i; i < dataLength; i += 1) {
            ohlc.push([
                data.bitfinex[i][0], // the date
                data.bitfinex[i][1], // open
                data.bitfinex[i][2], // high
                data.bitfinex[i][3], // low
                data.bitfinex[i][4] // close
            ]);

            volume.push([
                data.bitfinex[i][0], // the date
                data.bitfinex[i][5] // the volume
            ]);
        }

        // create the chart
        Highcharts.stockChart('chart--ohlcv', {

            rangeSelector: {
                selected: 1
            },

            title: {
                text: 'ETH / BTC Historical'
            },

            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],

            tooltip: {
                split: true
            },

            series: [{
                type: 'candlestick',
                name: 'ETH/BTC',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }]
        });
        $('.loader').css('opacity', '0')
        $('#overlay').css('opacity', '0')
    }





}));
