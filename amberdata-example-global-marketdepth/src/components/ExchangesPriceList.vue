<template>
  <main class="h-full w-full">
    <div class="h-7 row-span-1 text-center border-b border-gray-1000">
      <span class="text-gray-500 text-xs">Exchanges</span>
    </div>
    <div
      class="flex flex-col w-full overflow-y-scroll"
      style="height: calc(100% - 1.75rem)"
    >
      <div
        v-for="key in Object.keys(data)"
        :key="key"
        class="flex flex-col col-span-1 text-gray-500 border-b border-gray-1000 p-1"
      >
        <div class="flex justify-start">
          <span class="mr-2 text-1xs uppercase">{{ pair }}</span>
          <span class="mr-2 text-1xs">{{ exchangeNames[key] }}</span>
        </div>
        <div class="flex justify-between col-span-1">
          <span class="flex-1 w-1/3 text-gray-300 text-xs">{{
            data[key].price
          }}</span>
          <span
            :class="['flex-1 w-1/3 text-xs', getPercentChangeColor(data[key])]"
            >{{ getPercentChange(data[key]) }}</span
          >
          <span class="flex-1 w-1/3 text-gray-400 text-xs text-right">{{
            data[key].volume
          }}</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const exchangeNames = {
  bitfinex: "Bitfinex",
  bitstamp: "Bitstamp",
  ftx: "Ftx",
  gdax: "Coinbase Pro",
  gemini: "Gemini",
  kraken: "Kraken",
  poloniex: "Poloniex",
  zb: "ZB",
};

const data = {
  // binance: { price24hr: 0, price: '-', volume: '-', pair: 'BTC_USD' },
  bitfinex: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  bitstamp: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  ftx: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  gdax: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  gemini: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  // huobi: { price24hr: 0, price: '-', volume: '-', pair: 'BTC_USD' },
  kraken: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  // okex: { price24hr: 0, price: '-', volume: '-', pair: 'BTC_USD' },
  // poloniex: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
  // zb: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
};

const getPercent = (o, n) => ((o - n) / o) * 100;

export default {
  data() {
    return {
      exchangeNames,
      currentPrice: 41959.98,
      data,
    };
  },

  computed: {
    ...mapGetters([
      "baseApiUrl",
      "apiKey",
      "exchanges",
      "exchangesActive",
      "asset",
    ]),
    pair() {
      return `${
        this.asset && this.asset.pair ? this.asset.pair : "btc_usd"
      }`.toUpperCase();
    },
  },

  methods: {
    ...mapActions(["update", "addExchangePrice"]),
    getPercentChange(item) {
      const perc = getPercent(this.currentPrice, item.price);
      let operator = perc < 0 ? "" : "+";
      if (perc === 0) operator = "";
      return `${operator}${perc.toFixed(2)}%`;
    },
    getPercentChangeColor(item) {
      const perc = getPercent(this.currentPrice, item.price);
      let color = "text-gray-500";
      if (perc > 0) color = "text-limegreen-600";
      if (perc < 0) color = "text-cerise-600";
      return `${color}`;
    },
    async getData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const url = `${this.baseApiUrl}market/spot/ohlcv/${pair}/latest?timeFormat=ms`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);
      console.log("EXCHNAGES", data.payload);

      if (data.payload && Object.keys(data.payload).length) {
        for (const key in data.payload) {
          const price = parseFloat(data.payload[key].close).toFixed(2);
          this.addExchangePrice({
            exchange: key,
            timestamp: data.payload[key].timestamp,
            price,
            // set once, then use for computing percent change
            price24hr: price,
            volume: data.payload[key].volume,
          });
        }
      }
    },
    setDefaultData() {
      this.update({
        key: "exchanges",
        value: data,
      });
    },
  },

  mounted() {
    this.setDefaultData();
    this.getData();
  },

  $watch: {
    asset: ["getData"],
  },
};
</script>
