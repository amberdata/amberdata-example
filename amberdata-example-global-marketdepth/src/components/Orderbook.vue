<template>
  <main class="h-full w-full overflow-hidden">
    <div
      class="bg-cerise-1000 px-4 py-0"
      v-if="orderbookBucketed && orderbookBucketed.asks"
    >
      <div
        v-for="a in orderbookBucketed.asks"
        :key="a"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span class="flex-1 w-1/3 text-cerise-600">{{ a.price }}</span>
        <span class="flex-1 w-1/3 text-gray-300 text-left">{{ a.volume }}</span>
        <span class="flex-1 w-1/3 text-gray-300 text-right">{{
          a.totalVolume
        }}</span>
      </div>
    </div>
    <div class="row-span-1 text-gray-200 font-extralight text-center">
      {{ priceUSD }} USD
    </div>
    <div
      class="bg-limegreen-1000 px-4 py-0"
      v-if="orderbookBucketed && orderbookBucketed.bids"
    >
      <div
        v-for="b in orderbookBucketed.bids"
        :key="b"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span class="flex-1 w-1/3 text-limegreen-600">{{ b.price }}</span>
        <span class="flex-1 w-1/3 text-gray-300 text-left">{{ b.volume }}</span>
        <span class="flex-1 w-1/3 text-gray-300 text-right">{{
          b.totalVolume
        }}</span>
      </div>
    </div>
  </main>
</template>

<script>
import { DateTime } from "luxon";
import { mapActions, mapGetters } from "vuex";
import { OrderBook } from "../utils/orderbook";

const normalizeRestOrders = (a, isBid, base) => {
  // Needs to return the following:
  //   [
  //     "gdax",        < - exchange
  //     "btc_usd",     < - pair
  //     1554255211066, < - timestamp
  //     849121,        < - timestampNanoseconds
  //     4935.73,       < - price
  //     2.1,           < - volume
  //     true < - isBid
  //   ]
  return [base.exchange, base.pair, a[3], 0, a[0], a[1], isBid];
};

// const orders = {
//   asks: [
//     { price: 42859.98, volume: 8.734322, total: 1298.734322 },
//   ],
//   bids: [
//     { price: 41959.98, volume: 8.734322, total: 1298.734322 },
//   ],
// };

export default {
  data() {
    return {
      // orders,
      prevPrice: "-",
      timer: null,
      orderbookRaw: null,
      bucketSize: 10,
    };
  },

  computed: {
    ...mapGetters([
      "baseApiUrl",
      "apiKey",
      "orderbook",
      "orderbookBucketed",
      "orderEventsActive",
      "orderSnapshotsActive",
      "price",
      "asset",
    ]),
    priceUSD() {
      if (this.price && this.price.price) {
        this.prevPrice = parseFloat(this.price.price).toFixed(2);
      }
      return this.prevPrice;
    },
  },

  methods: {
    ...mapActions(["update"]),
    updateTabPrice() {
      if (this.priceUSD !== "-")
        document.title = `${this.priceUSD} BTC_USD | Global Digital Asset Markets - by Amberdata.io`;
    },
    async getDataByFilters(exchange, pair) {
      const now = DateTime.utc();
      const timestamp = now.minus({ minutes: 1 }).toMillis();
      const start = now.minus({ minutes: 3 }).toMillis();
      const end = now.minus({ minutes: 1 }).toMillis();
      const url = `${this.baseApiUrl}market/spot/order-book-snapshots/${pair}/historical?timestamp=${timestamp}&exchange=${exchange}&timeFormat=ms`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);
      // console.log("getDataByFilters", exchange, pair, url, data);

      if (
        data.payload &&
        data.payload.data &&
        Object.keys(data.payload.data).length
      ) {
        const { bid, ask } = data.payload.data;
        return { bids: bid, asks: ask };
      }
      return { bids: [], asks: [] };
    },
    async getAllData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const p = [];
      // const exchanges = ["bitfinex"];
      const exchanges = ["bitfinex", "bitstamp", "gdax", "gemini", "kraken"];
      let allBids = [];
      let allAsks = [];

      const allOrderBooks = await Promise.all(
        exchanges.map((exchange) => this.getDataByFilters(exchange, pair))
      );

      // combine all like-kind sets
      allOrderBooks.forEach((book) => {
        allBids = allBids.concat(book.bids);
        allAsks = allAsks.concat(book.asks);
      });
      console.log("allBids", allBids);
      console.log("allAsks", allAsks);

      const ob = new this.$OrderBook().initializePoints({
        bids: allBids.map((b) => normalizeRestOrders(b, true, { pair })),
        asks: allAsks.map((a) => normalizeRestOrders(a, false, { pair })),
      });
      this.orderbookRaw = ob;
      this.update({ key: "orderbook", value: ob.getOrderbook() || [] });
      this.update({
        key: "orderbookBucketed",
        value: ob.getOrderbookBucketed(this.bucketSize) || [],
      });
    },
    async getData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const now = DateTime.utc();
      const timestamp = now.minus({ minutes: 1 }).toMillis();
      const start = now.minus({ minutes: 3 }).toMillis();
      const end = now.minus({ minutes: 1 }).toMillis();
      const exchange = "bitfinex";
      const url = `${this.baseApiUrl}market/spot/order-book-snapshots/${pair}/historical?timestamp=${timestamp}&exchange=${exchange}&timeFormat=ms`;
      // const url = `${this.baseApiUrl}market/spot/order-book-snapshots/${pair}/historical?startDate=${start}&endDate=${end}&exchange=${exchange}&timeFormat=ms`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);

      if (
        data.payload &&
        data.payload.data &&
        Object.keys(data.payload.data).length
      ) {
        const { bid, ask } = data.payload.data;
        const ob = new this.$OrderBook().initializePoints({
          bids: bid.map((b) =>
            normalizeRestOrders(b, true, { exchange, pair })
          ),
          asks: ask.map((a) =>
            normalizeRestOrders(a, false, { exchange, pair })
          ),
        });
        this.orderbookRaw = ob;
        this.update({ key: "orderbook", value: ob.getOrderbook() || [] });
        this.update({
          key: "orderbookBucketed",
          value: ob.getOrderbookBucketed(this.bucketSize) || [],
        });
      }
    },
    getFormatedTs(utcMs) {
      if (!utcMs) return "00:00:00";
      return DateTime.fromMillis(utcMs).toFormat("HH:mm:ss");
    },
    // connectWs() {
    //   if (!this.tradesActive) return;
    //   if (!this.$w3s || !this.$w3s._subscribe || !this.$w3s.objects) return;
    //   const evt = {
    //     name: "trades",
    //     args: ["market:trades", { ...this.asset }],
    //     subscription: null,
    //     object: null,
    //   };
    //   this.$w3s.objects.trades = evt;
    //   this.$w3s._subscribe(evt.name, evt.args);
    // },
    // disconnectWs() {
    //   if (!this.$w3s) return;
    //   this.$w3s._unsubscribe("trades");
    // },
  },

  mounted() {
    this.getData();
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(this.updateTabPrice, 1000);
    // // connect WS stuffs
    // setTimeout(() => {
    //   this.connectWs();
    // }, 3000);
    // setInterval(() => {
    //   this.getData();
    // }, 60 * 1000);
    this.getAllData();
  },

  // $watch: {
  //   asset: ["disconnectWs", "connectWs"],
  // },
};
</script>
