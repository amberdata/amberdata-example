<template>
  <main class="h-full w-full">
    <div class="bg-cerise-1000 px-4 py-0">
      <div
        v-for="a in orders.asks"
        :key="a"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span class="text-cerise-700">{{ a.price }}</span>
        <span class="text-gray-300">{{ a.volume }}</span>
        <span class="text-gray-300">{{ a.total }}</span>
      </div>
    </div>
    <div class="row-span-1 text-gray-200 font-extralight text-center">
      {{ priceUSD }} USD
    </div>
    <div class="bg-limegreen-1000 px-4 py-0">
      <div
        v-for="b in orders.bids"
        :key="b"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span class="text-limegreen-600">{{ b.price }}</span>
        <span class="text-gray-300">{{ b.volume }}</span>
        <span class="text-gray-300">{{ b.total }}</span>
      </div>
    </div>
  </main>
</template>

<script>
import { mapGetters } from "vuex";
const orders = {
  asks: [
    { price: 42859.98, volume: 8.734322, total: 1298.734322 },
    { price: 42759.98, volume: 8.734322, total: 1298.734322 },
    { price: 42659.98, volume: 8.734322, total: 1298.734322 },
    { price: 42559.98, volume: 8.734322, total: 1298.734322 },
    { price: 42459.98, volume: 8.734322, total: 1298.734322 },
    { price: 42359.98, volume: 8.734322, total: 1298.734322 },
    { price: 42259.98, volume: 8.734322, total: 1298.734322 },
    { price: 42115.98, volume: 8.734322, total: 1298.734322 },
  ],
  bids: [
    { price: 41959.98, volume: 8.734322, total: 1298.734322 },
    { price: 41859.98, volume: 8.734322, total: 1298.734322 },
    { price: 41759.98, volume: 8.734322, total: 1298.734322 },
    { price: 41659.98, volume: 8.734322, total: 1298.734322 },
    { price: 41559.98, volume: 8.734322, total: 1298.734322 },
    { price: 41459.98, volume: 8.734322, total: 1298.734322 },
    { price: 41359.98, volume: 8.734322, total: 1298.734322 },
    { price: 41259.98, volume: 8.734322, total: 1298.734322 },
  ],
};

export default {
  data() {
    return {
      // priceUSD: 42059.98,
      orders,
    };
  },

  computed: {
    ...mapGetters(["price"]),
    priceUSD() {
      return this.price && this.price.price
        ? parseFloat(this.price.price).toFixed(4)
        : "-";
    },
  },
};
</script>
