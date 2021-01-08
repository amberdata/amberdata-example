<template>
  <main class="flex h-full w-full">
    <div class="h-full w-full grid grid-flow-col grid-rows-1 grid-cols-2 gap-4">
      <div class="col-span-1 text-gray-200 border-r border-gray-1000">
        <OhlcvVwapChart />
      </div>
      <div class="col-span-1 border-l border-gray-1000">
        <div class="h-full grid grid-flow-row grid-rows-2 grid-cols-2 gap-0">
          <div class="col-span-1 border-r border-b border-gray-1000">
            <MarketDepthChart />
          </div>
          <div class="col-span-1 border-b border-gray-1000">
            <Orderbook />
          </div>
          <div class="col-span-1 border-r border-gray-1000">
            <ExchangesPriceList />
          </div>
          <div class="col-span-1">
            <Trades />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import ExchangesPriceList from "../components/ExchangesPriceList.vue";
import MarketDepthChart from "../components/MarketDepthChart.vue";
import OhlcvVwapChart from "../components/OhlcvVwapChart.vue";
import Orderbook from "../components/Orderbook.vue";
import Trades from "../components/Trades.vue";

export default {
  components: {
    ExchangesPriceList,
    MarketDepthChart,
    OhlcvVwapChart,
    Orderbook,
    Trades,
  },
};
</script>