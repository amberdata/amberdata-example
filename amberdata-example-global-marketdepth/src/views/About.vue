<template>
  <main>
    <div class="bg-gray-50">
      <div
        class="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between"
      >
        <h2
          class="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10"
        >
          About Page
          <br />
          <span class="text-indigo-600">Vite 2.x + Vue 3.x + Tailwind 2.x</span>
        </h2>
        <div class="mt-8 flex lg:flex-shrink-0 lg:mt-0">
          <div class="inline-flex rounded-md shadow">
            <router-link
              to="/"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >Back Home</router-link
            >
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <a
              target="_blank"
              href="https://github.com/web2033/vite-vue3-tailwind-starter"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-indigo-600 bg-white hover:text-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >Learn more</a
            >
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
