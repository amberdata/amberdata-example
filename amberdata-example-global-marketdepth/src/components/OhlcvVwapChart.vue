<template>
  <main class="h-full w-full">
    <div class="flex justify-start border-b border-gray-1000">
      <div
        class="flex flex-0 border-r border-gray-1000 text-xs text-gray-300 font-light p-2"
      >
        <span class="flex-0 mr-1">Global VWAP</span>
        <span class="flex-1 mr-1">BTC_USD</span>
        <svg
          class="flex-0 w-3 h-4 stroke-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <div
        class="w-full flex-1 flex justify-between text-1xs text-gray-700 font-light p-2"
      >
        <h4>
          <span class="flex-0 mr-1">O:</span>
          <span>{{ currentOHLCVTick.open }}</span>
        </h4>
        <h4>
          <span class="flex-0 mr-1">H:</span>
          <span>{{ currentOHLCVTick.high }}</span>
        </h4>
        <h4>
          <span class="flex-0 mr-1">L:</span>
          <span>{{ currentOHLCVTick.low }}</span>
        </h4>
        <h4>
          <span class="flex-0 mr-1">C:</span>
          <span>{{ currentOHLCVTick.close }}</span>
        </h4>
        <h4>
          <span class="flex-0 mr-1">V:</span>
          <span>{{ currentOHLCVTick.volume }}</span>
        </h4>
        <h4>
          <!-- <span class="flex-0 mr-1">H:</span> -->
          <span>{{ currentOHLCVTick.percentChange }}</span>
        </h4>
      </div>
    </div>
    <div id="ohlcv_vwap" class="p-0"></div>
  </main>
</template>

<script>
import { DateTime } from "luxon";
import { mapActions, mapGetters } from "vuex";
import { createChart, CrosshairMode } from "lightweight-charts";

const chartOptions = {
  width: 600,
  height: 300,
  rightPriceScale: {
    visible: false,
    borderColor: "rgba(0, 0, 0, 1)",
  },
  leftPriceScale: {
    visible: true,
    borderColor: "rgba(0, 0, 0, 1)",
  },
  layout: {
    backgroundColor: "#0E0D0F",
    textColor: "#184849",
  },
  grid: {
    horzLines: {
      color: "#222222",
    },
    vertLines: {
      color: "#222222",
    },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  timeScale: {
    borderColor: "rgba(0, 0, 0, 1)",
    timeVisible: true,
    secondsVisible: false,
  },
  handleScroll: {
    vertTouchDrag: false,
  },
};

const getFormattedOHLCV = (arr) =>
  arr.map((o) => {
    return {
      // time: new Date(o[0]).toISOString(),
      time: +new Date(o[0]) / 1000,
      open: o[1],
      high: o[2],
      low: o[3],
      close: o[4],
      value: o[5],
    };
  });

const getFormattedVwap = (arr) =>
  arr.map((o) => {
    return {
      // time: new Date(o[0]).toISOString(),
      time: +new Date(o.timestamp) / 1000,
      value: parseFloat(o.vwap),
      volume: parseFloat(o.volume),
    };
  });

export default {
  data() {
    return {
      refreshAll: null,
      chart: null,
      candleSeries: null,
      volumeSeries: null,
      vwapSeries: null,

      allCandles: [],
      // currentOHLCVTick: {
      //   open: 0.0,
      //   high: 0.0,
      //   low: 0.0,
      //   close: 0.0,
      //   volume: "0",
      //   percentChange: "0%",
      // },
    };
  },

  computed: {
    ...mapGetters(["baseApiUrl", "apiKey", "ohlcv", "ohlcvActive", "asset"]),
    currentOHLCVTick() {
      if (!this.ohlcv.length) {
        return {
          open: 0.0,
          high: 0.0,
          low: 0.0,
          close: 0.0,
          volume: "0",
          percentChange: "0%",
        };
      }
      const arr = this.ohlcv.reverse().slice(0, 20);
      const lastItem = arr[arr.length - 1];
      return {
        open: lastItem[1],
        high: lastItem[2],
        low: lastItem[3],
        close: lastItem[4],
        volume: lastItem[5],
        percentChange: "-%",
      };
    },
  },

  methods: {
    ...mapActions(["update"]),
    computeOhlcv(data) {},
    async getOHLCVData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const now = DateTime.utc();
      const end = now.toISO();
      const start = now.minus({ hours: 3 }).toISO();
      const url = `${this.baseApiUrl}market/spot/ohlcv/${pair}/historical?startDate=${start}&endDate=${end}&timeFormat=ms&timeInterval=minutes`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);

      if (
        data.payload &&
        data.payload.data &&
        Object.keys(data.payload.data).length
      ) {
        const exOhlcv =
          data.payload.data["gdax"] ||
          data.payload.data[Object.keys(data.payload.data)[0]];
        const value = getFormattedOHLCV(exOhlcv);
        this.update({ key: "ohlcv", value });
        this.updateChartDataByType("candleSeries", value);
        this.updateChartDataByType("volumeSeries", value);
      }
    },
    async getVwapData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const now = DateTime.utc();
      const end = now.toISO();
      const start = now.minus({ hours: 3 }).toISO();
      const url = `${this.baseApiUrl}market/spot/vwap/pairs/${pair}/historical?startDate=${start}&endDate=${end}&timeFormat=ms&timeInterval=minutes`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);

      if (data.payload && data.payload.data && data.payload.data.length) {
        const value = getFormattedVwap(data.payload.data);
        this.update({ key: "vwap", value });
        this.updateChartDataByType("vwapSeries", value);
      }
    },
    getFormatedTs(utcMs) {
      if (!utcMs) return "00:00:00";
      return DateTime.fromMillis(utcMs).toFormat("HH:mm:ss");
    },
    connectWs() {
      if (!this.ohlcvActive) return;
      if (!this.$w3s || !this.$w3s._subscribe || !this.$w3s.objects) return;
      const evt = {
        name: "ohlcv",
        args: ["market:ohlcv", { ...this.asset }],
        subscription: null,
        object: null,
      };
      this.$w3s.objects.trades = evt;
      this.$w3s._subscribe(evt.name, evt.args);
    },
    disconnectWs() {
      if (!this.$w3s) return;
      this.$w3s._unsubscribe("trades");
    },

    createChart() {
      this.chart = createChart(document.getElementById("ohlcv_vwap"), {
        ...chartOptions,
        width: this.$el.clientWidth - 1 || 400,
        height: this.$el.clientHeight - 40 || 300,
      });

      // { time: { year: 2018, month: 9, day: 22 }, value: 25.531816900940186 },
      this.vwapSeries = this.chart.addLineSeries({
        color: "#b5f6eb",
        // color: "#26a69a",
        // priceFormat: {
        //   type: "vwap",
        // },
        lineWidth: 1,
        priceScaleId: "right",
      });

      // {
      //   time: "2018-10-19",
      //   value: 19103293.0,
      //   color: "rgba(0, 150, 136, 0.8)",
      // },
      this.volumeSeries = this.chart.addHistogramSeries({
        // color: "#26a69a",
        color: "rgba(255,255,255, 0.25)",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
      });

      // {
      //   close: 108.9974612905403,
      //   high: 121.20998259466148,
      //   low: 96.65376292551082,
      //   open: 104.5614412226746,
      //   time: { year: 2018, month: 9, day: 22 },
      // },
      this.candleSeries = this.chart.addCandlestickSeries({
        priceScaleId: "left",
      });
    },
    updateChartDataByType(type, data) {
      this[type].setData(data);
    },
  },

  mounted() {
    this.createChart();
    this.getVwapData();
    this.getOHLCVData();

    // TODO: Add WS stuff!!!!!!!!!!!!
    // // connect WS stuffs
    // setTimeout(() => {
    //   this.connectWs();
    // }, 3000);

    // make sure we're in sync every minute
    if (this.refreshAll) clearInterval(this.refreshAll);
    this.refreshAll = setInterval(() => {
      this.getVwapData();
      this.getOHLCVData();
    }, 60 * 1000);
  },

  $watch: {
    // ohlcv: ["computeOhlcv"],
    // asset: ["disconnectWs", "connectWs"],
  },
};
</script>
