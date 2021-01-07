<template>
  <main class="h-full w-full">
    <div class="h-7 row-span-1 border-b border-gray-1000 text-right px-4">
      <span class="text-gray-700 text-xs">{{ currentTime }}</span>
    </div>
    <div
      class="flex flex-col w-full overflow-y-scroll px-4 py-2"
      style="height: calc(100% - 1.75rem)"
    >
      <div
        v-for="t in trades"
        :key="t"
        class="flex justify-between col-span-1 text-1xs"
      >
        <span
          :class="{
            'text-limegreen-600': t.isBid,
            'text-cerise-600': !t.isBid,
          }"
          >{{ t.price }}</span
        >
        <span class="text-gray-500">{{ t.volume }}</span>
        <span class="text-gray-500">{{ t.timestamp }}</span>
      </div>
    </div>
  </main>
</template>

<script>
const trades = [
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: false },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
  { price: 41959.98, volume: 8.734322, timestamp: 1651298734322, isBid: true },
];

export default {
  data() {
    return {
      currentTime: "12:08:23",
      trades,
    };
  },
};
</script>
