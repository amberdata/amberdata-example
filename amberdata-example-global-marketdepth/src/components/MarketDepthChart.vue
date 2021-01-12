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
    window.chart = chart;

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

  mounted() {
    this.chart = initCharts(this.apiKey);
  },

  watch: {
    orderbook: (newV) => {
      window.chart.data = newV.bids.concat(newV.asks);
    },
  },
};
</script>
