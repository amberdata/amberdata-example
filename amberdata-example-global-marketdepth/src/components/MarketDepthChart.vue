<template>
  <div id="chart--depth" class="w-full h-full"></div>
</template>

<script>
import { mapGetters } from "vuex";

const initCharts = async (api_key) => {
  return am4core.ready(function () {
    // Create chart instance
    var chart = am4core.create("chart--depth", am4charts.XYChart);
    // remove dumb logo
    chart.logo.group.node.innerHTML = null;

    // Add data
    chart.dataSource.requestOptions.requestHeaders = [
      {
        key: "x-api-key",
        value: api_key,
      },
    ];
    chart.dataSource.url = `https://web3api.io/api/v2/market/spot/order-book-snapshots/btc_usd/historical?exchange=bitfinex&timestamp=${
      new Date().getTime() - 3600000.0
    }`;
    chart.dataSource.adapter.add("parsedData", function (data) {
      // Function to process (sort and calculate cumulative volume)
      function processData(list, type, desc) {
        // Convert to data points
        for (var i = 0; i < list.length; i++) {
          list[i] = {
            value: Number(list[i][0]),
            volume: Number(list[i][1]),
          };
        }

        // Sort list just in case
        list.sort(function (a, b) {
          if (a.value > b.value) {
            return 1;
          } else if (a.value < b.value) {
            return -1;
          } else {
            return 0;
          }
        });

        // Calculate cummulative volume
        if (desc) {
          for (var i = list.length - 1; i >= 0; i--) {
            if (i < list.length - 1) {
              list[i].totalvolume = list[i + 1].totalvolume + list[i].volume;
            } else {
              list[i].totalvolume = list[i].volume;
            }
            var dp = {};
            dp["value"] = list[i].value;
            dp[type + "volume"] = list[i].volume;
            dp[type + "totalvolume"] = list[i].totalvolume;
            res.unshift(dp);
          }
        } else {
          for (var i = 0; i < list.length; i++) {
            if (i > 0) {
              list[i].totalvolume = list[i - 1].totalvolume + list[i].volume;
            } else {
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
      // console.log(data.payload.data);
      processData(data.payload.data.bid, "bids", true);
      processData(data.payload.data.ask, "asks", false);

      window.data = res;
      return res;
    });

    // Set up precision for numbers
    chart.numberFormatter.numberFormat = "#,###.####";
    chart.padding(0, 0, 0, 0);

    chart.titles.template.fontSize = 7;
    chart.titles.template.textAlign = "left";
    chart.titles.template.isMeasured = false;

    // Create axes
    var xAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    xAxis.title.text = null;
    xAxis.dataFields.category = "value";
    xAxis.renderer.minGridDistance = 0;
    xAxis.renderer.inside = true;
    xAxis.renderer.maxLabelPosition = 0;
    // xAxis.renderer.labels.template.dy = -20;
    // xAxis.renderer.labels.template.dx = -20;
    xAxis.renderer.labels.template.fill = am4core.color("#514c51");

    var yAxis = chart.xAxes.push(new am4charts.ValueAxis());
    // yAxis.title.text = "Volume";
    yAxis.title.text = null;
    yAxis.renderer.inversed = true;
    yAxis.renderer.inside = true;
    yAxis.renderer.maxLabelPosition = 0.99;
    yAxis.renderer.labels.template.dx = -20;
    // yAxis.renderer.labels.template.fill = am4core.color("#514c51");
    // yAxis.renderer.labels.template.fill = am4core.color("#000");
    yAxis.renderer.labels.template.display = "none";

    // Create series
    var series = chart.series.push(new am4charts.StepLineSeries());
    // series.dataFields.categoryX = "value";
    // series.dataFields.valueY = "bidstotalvolume";
    series.dataFields.categoryY = "value";
    series.dataFields.valueX = "bidstotalvolume";
    series.strokeWidth = 1;
    series.stroke = am4core.color("#00aa40");
    series.fill = series.stroke;
    series.fillOpacity = 0.2;
    // series.tooltipText =
    //   "Bid: [bold]{categoryX}[/]\nTotal volume: [bold]{valueX}[/]\nVolume: [bold]{bidsvolume}[/]";
    // series.interpolationDuration = 500;
    // series.sequencedInterpolation = true;
    // series.sequencedInterpolationDelay = 100;

    var series2 = chart.series.push(new am4charts.StepLineSeries());
    // series2.dataFields.categoryX = "value";
    // series2.dataFields.valueY = "askstotalvolume";
    series2.dataFields.categoryY = "value";
    series2.dataFields.valueX = "askstotalvolume";
    series2.strokeWidth = 1;
    series2.stroke = am4core.color("#e8093a");
    series2.fill = series2.stroke;
    series2.fillOpacity = 0.2;
    // series2.tooltipText =
    //   "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueX}[/]\nVolume: [bold]{asksvolume}[/]";
    // series2.interpolationDuration = 500;
    // series2.sequencedInterpolation = true;
    // series2.sequencedInterpolationDelay = 100;

    var series3 = chart.series.push(new am4charts.ColumnSeries());
    // series3.dataFields.categoryX = "value";
    // series3.dataFields.valueY = "bidsvolume";
    series3.dataFields.categoryY = "value";
    series3.dataFields.valueX = "bidsvolume";
    series3.strokeWidth = 0;
    series3.fill = am4core.color("#f9f9f9");
    series3.fillOpacity = 0.5;
    // series3.interpolationDuration = 500;

    var series4 = chart.series.push(new am4charts.ColumnSeries());
    // series4.dataFields.categoryX = "value";
    // series4.dataFields.valueY = "asksvolume";
    series4.dataFields.categoryY = "value";
    series4.dataFields.valueX = "asksvolume";
    series4.strokeWidth = 0;
    series4.fill = am4core.color("#f9f9f9");
    series4.fillOpacity = 0.5;
    // series4.interpolationDuration = 500;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // chart sizing
    chart.leftAxesContainer = "none";
    // chart.width = 400;
    // chart.height = 400;
    // window.chart = chart;

    return chart;
  });
};

export default {
  name: "MarketDepthChart",

  data() {
    return {
      // Chart data
      chart: null,
      chartName: "chartdiv",

      // Market data
      exchangeSelected: null,
      pairSelected: null,
    };
  },

  computed: {
    ...mapGetters(["apiKey", "orderbook"]),
  },

  methods: {
    fullOrderbook() {
      console.log("fullOrderbook", this.orderbook);
      if (!this.orderbook.bids || !this.orderbook.bids) return [];
      this.chart.data = this.orderbook.bids.concat(this.orderbook.asks);
    },
  },

  mounted() {
    this.chart = initCharts(this.apiKey);
  },

  $watch: {
    orderbook: ["fullOrderbook"],
  },
};
</script>
