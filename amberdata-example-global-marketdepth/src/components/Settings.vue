<template>
  <div
    class="z-40 fixed inset-0 overflow-hidden"
    :class="{ hidden: !settingsPanelActive }"
  >
    <div class="absolute inset-0 overflow-hidden">
      <!--
      Background overlay, show/hide based on slide-over state.

      Entering: "ease-in-out duration-500"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in-out duration-500"
        From: "opacity-100"
        To: "opacity-0"
    -->
      <div
        class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        :class="{ hidden: !settingsPanelActive }"
        aria-hidden="true"
      ></div>
      <section
        class="absolute inset-y-0 right-0 pl-10 max-w-full flex"
        aria-labelledby="slide-over-heading"
      >
        <!--
        Slide-over panel, show/hide based on slide-over state.

        Entering: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-full"
          To: "translate-x-0"
        Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-0"
          To: "translate-x-full"
      -->
        <div
          class="relative w-screen max-w-md"
          :class="{ hidden: !settingsPanelActive }"
        >
          <!--
          Close button, show/hide based on slide-over state.

          Entering: "ease-in-out duration-500"
            From: "opacity-0"
            To: "opacity-100"
          Leaving: "ease-in-out duration-500"
            From: "opacity-100"
            To: "opacity-0"
        -->
          <div
            class="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4"
          >
            <button
              class="rounded-md text-gray-1100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
              @click.prevent="closePanel"
            >
              <span class="sr-only">Close panel</span>
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            class="h-full flex flex-col py-6 bg-gray-1100 shadow-xl overflow-y-scroll"
          >
            <div class="px-4 sm:px-6">
              <h2
                id="slide-over-heading"
                class="text-lg font-medium text-gray-200"
              >
                Settings
              </h2>
            </div>
            <div class="mt-6 relative flex-1 px-4 sm:px-6">
              <div class="grid grid-cols-3 gap-6">
                <div class="col-span-3 sm:col-span-2">
                  <label
                    for="settings_api_key"
                    class="block text-sm font-medium text-gray-100"
                  >
                    Amberdata API Key
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span
                      class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs uppercase font-bold"
                    >
                      KEY
                    </span>
                    <input
                      type="text"
                      name="settings_api_key"
                      v-model="tmpApiKey"
                      @change="changeTmpApiKey"
                      id="settings_api_key"
                      class="p-1 focus:ring-pine-500 focus:border-pine-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                      placeholder="UAK..."
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Get your api key here:
                    <a
                      class="underline text-cooper-400"
                      href="https://amberdata.io/pricing"
                      target="_blank"
                      >Amberdata.io</a
                    >
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      tmpApiKey: "",
    };
  },

  emits: ["update:tmpApiKey"],

  computed: {
    ...mapGetters(["apiKey", "settingsPanelActive"]),
  },

  methods: {
    ...mapActions(["update", "setApiKey", "loadApiKeyFromCache"]),
    closePanel() {
      this.update({ key: "settingsPanelActive", value: false });
    },
    changeTmpApiKey() {
      this.setApiKey(this.tmpApiKey);
    },
  },

  mounted() {
    this.loadApiKeyFromCache();
    this.tmpApiKey = this.apiKey;
    // this.loadW3DConnection(window.localStorage.apiKey || this.tmpApiKey);
  },
};
</script>
