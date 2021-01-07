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
        v-for="item in data"
        :key="item"
        class="flex flex-col col-span-1 text-gray-500 border-b border-gray-1000 p-1"
      >
        <div class="flex justify-start">
          <span class="mr-2 text-1xs">{{ item.exchange }}</span>
          <span class="text-1xs uppercase">{{ item.pair }}</span>
        </div>
        <div class="flex justify-between col-span-1">
          <span class="text-gray-300 text-xs">{{ item.price }}</span>
          <span :class="['text-xs', getPercentChangeColor(item)]">{{
            getPercentChange(item)
          }}</span>
          <span class="text-gray-400 text-xs">{{ item.volume }}</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
const data = [
  { price: 41939.98, volume: "568.73k", exchange: "Binance", pair: "BTC_USD" },
  { price: 42001.28, volume: "568.73k", exchange: "Bitfinex", pair: "BTC_USD" },
  { price: 41919.98, volume: "568.73k", exchange: "Bitstamp", pair: "BTC_USD" },
  { price: 41989.98, volume: "568.73k", exchange: "BitMEX", pair: "BTC_USD" },
  {
    price: 41999.98,
    volume: "568.73k",
    exchange: "Coinbase Pro",
    pair: "BTC_USD",
  },
  { price: 41969.98, volume: "568.73k", exchange: "Kraken", pair: "BTC_USD" },
  { price: 41949.98, volume: "568.73k", exchange: "Poloniex", pair: "BTC_USD" },
  { price: 41953.98, volume: "568.73k", exchange: "ZB", pair: "BTC_USD" },
];

const getPercent = (o, n) => ((o - n) / o) * 100;

export default {
  data() {
    return {
      currentTime: "12:08:23",
      currentPrice: 41959.98,
      data,
    };
  },

  methods: {
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
  },
};
</script>
