<template>
  <main class="h-full w-full">
    <div class="h-7 row-span-1 text-center border-b border-gray-1000">
      <span class="text-gray-500 text-xs">Exchanges</span>
    </div>
    <div
      class="flex flex-col w-full overflow-y-scroll overscroll-x-hidden"
      style="height: calc(100% - 1.75rem)"
    >
      <div
        v-for="key in Object.keys(data)"
        :key="key"
        class="flex flex-col col-span-1 w-full text-gray-500 border-b border-gray-1000 p-1"
      >
        <div class="flex justify-start">
          <span class="mr-2 text-1xs uppercase">{{ pair }}</span>
          <span class="mr-2 text-1xs">{{ exchangeNames[key] }}</span>
        </div>
        <div class="flex justify-between col-span-1 w-full">
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
import { DateTime } from "luxon";

const exchangeNames = {
  bitfinex: "Bitfinex",
  bitstamp: "Bitstamp",
  ftx: "FTX",
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
  // ftx: { price24hr: 0, price: "-", volume: "-", pair: "BTC_USD" },
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
      const perc = getPercent(item.price24hr, item.price);
      let operator = item.price24hr > item.price ? "-" : "+";
      if (perc === 0) operator = "";
      return `${operator}${perc ? perc.toFixed(2) : ""}%`;
    },
    getPercentChangeColor(item) {
      const perc = getPercent(item.price24hr, item.price);
      let color = "text-gray-500";
      if (item.price24hr < item.price) color = "text-limegreen-600";
      if (item.price24hr > item.price) color = "text-cerise-600";
      return `${color}`;
    },
    async getData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const now = DateTime.utc();
      const end = now.toMillis();
      const start = now.minus({ days: 2 }).toMillis();
      const url = `${this.baseApiUrl}market/spot/ohlcv/${pair}/historical?startDate=${start}&endDate=${end}&timeInterval=days`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);

      if (
        data.payload &&
        data.payload.data &&
        Object.keys(data.payload.data).length
      ) {
        for (const key in data.payload.data) {
          const lastItem =
            data.payload.data[key][data.payload.data[key].length - 1];
          const price = parseFloat(lastItem[4]).toFixed(2);
          this.addExchangePrice({
            exchange: key,
            timestamp: lastItem[0],
            price,
            // set once, then use for computing percent change
            // price24 needs to be first item so we know the DIFF
            price24hr: parseFloat(data.payload.data[key][0][4]).toFixed(2),
            volume: lastItem[5],
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
