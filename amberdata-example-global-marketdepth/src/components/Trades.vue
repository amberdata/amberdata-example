<template>
  <main class="h-full w-full">
    <div
      class="flex justify-between h-7 row-span-1 border-b border-gray-1000 px-4 py-1"
    >
      <span class="text-gray-700 text-xs">Trades</span>
      <span class="text-gray-700 text-xs">{{ currentTime }}</span>
    </div>
    <div
      class="flex flex-col w-full overflow-y-scroll px-4 py-2"
      style="height: calc(100% - 1.75rem)"
    >
      <div
        v-for="t in allTrades"
        :key="t"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span
          class="w-1/3 text-left"
          :class="{
            'text-limegreen-600': t[3],
            'text-cerise-600': !t[3],
          }"
          >{{ t[4] }}</span
        >
        <span class="w-1/3 text-left text-gray-500">{{ t[5] }}</span>
        <span class="w-1/3 text-right text-gray-500">{{
          getFormatedTs(t[1])
        }}</span>
      </div>
    </div>
  </main>
</template>

<script>
import { DateTime } from "luxon";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      currentTime: "00:00:00",
      timer: null,
    };
  },

  computed: {
    ...mapGetters(["baseApiUrl", "apiKey", "trades", "tradesActive", "asset"]),
    allTrades() {
      return this.trades.reverse().slice(0, 20);
    },
  },

  methods: {
    ...mapActions(["update"]),
    async getData() {
      const pair = this.asset && this.asset.pair ? this.asset.pair : "btc_usd";
      const now = DateTime.utc();
      const end = now.toISO();
      const start = now.minus({ minutes: 5 }).toISO();
      const url = `${this.baseApiUrl}market/spot/trades/${pair}/historical?startDate=${start}&endDate=${end}&timeFormat=ms`;
      const options = { headers: { "x-api-key": this.apiKey } };
      const { data } = await this.$http.get(url, options);

      if (data.payload && data.payload.data && data.payload.data.length) {
        this.update({
          key: "trades",
          value: data.payload.data,
        });
      }
    },
    getFormatedTs(utcMs) {
      if (!utcMs) return "00:00:00";
      return DateTime.fromMillis(utcMs).toFormat("HH:mm:ss");
    },
    setCurrentTime() {
      this.currentTime = DateTime.local().toFormat("HH:mm:ss");
    },
    connectWs() {
      if (!this.tradesActive) return;
      if (!this.$w3s || !this.$w3s._subscribe || !this.$w3s.objects) return;
      const evt = {
        name: "trades",
        args: ["market:trades", { ...this.asset }],
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
  },

  mounted() {
    this.getData();
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(this.setCurrentTime, 1000);

    // connect WS stuffs
    setTimeout(() => {
      this.connectWs();
    }, 3000);
  },

  $watch: {
    asset: ["disconnectWs", "connectWs"],
  },
};
</script>
