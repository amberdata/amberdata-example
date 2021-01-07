const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      // fontFamily: {
      //   sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
      // },
      fontFamily: {
        display: ['Roboto Mono', 'Menlo', 'monospace'],
        body: ['Roboto Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '4xs': '.25rem',
        '3xs': '.33rem',
        '2xs': '.5rem',
        '1xs': '.65rem',
      },
      colors: {
        gray: {
          '50': '#f8f9f9',
          '100': '#f4f5f4',
          '200': '#e6e8e5',
          '300': '#d4d4d2',
          '400': '#b4b0b0',
          '500': '#8b8b8b',
          '600': '#6a6365',
          '700': '#514c51',
          '800': '#3e3a41',
          '900': '#302f35',
          '1000': '#1D1C20',
          '1100': '#0E0D0F',
        },
        limegreen: { // long
          '50': '#ecf8f6',
          '100': '#d3f8ed',
          '200': '#a4f3d5',
          '300': '#63ebb8',
          '400': '#1ddc8a',
          '500': '#08c95d',
          '600': '#00aa40', // main
          '700': '#0e923e',
          '800': '#117339',
          '900': '#115d32',
          '1000': '#062413', // rgb(6, 36, 19)
        },
        cerise: { // short
          '50': '#fdf9f9',
          '100': '#fdeef4',
          '200': '#fbcde8',
          '300': '#fba2d5',
          '400': '#fc68b3',
          '500': '#fc3e8f',
          '600': '#f82467',
          '700': '#e8093a', // main
          '800': '#b5183f',
          '900': '#901431',
          '1000': '#22050B', // rgb(34, 5, 11)
        },
        pine: {
          '50': '#eff8f8',
          '100': '#dbf5f4',
          '200': '#b5f6eb', // main
          '300': '#7fe1d9',
          '400': '#37cbc3',
          '500': '#15aea9',
          '600': '#128f8c',
          '700': '#187372',
          '800': '#1a595a',
          '900': '#184849',
        },
        steel: {
          '50': '#f4f7f8',
          '100': '#ebf2f4',
          '200': '#d7e5ea',
          '300': '#bbd1de',
          '400': '#8bb1cc',
          '500': '#5f8bb7',
          '600': '#4a689c',
          '700': '#42507e',
          '800': '#373f61',
          '900': '#2e344d',
        },
        manatee: {
          '50': '#f4f7f8',
          '100': '#ecf2f5',
          '200': '#d7e4eb',
          '300': '#bcd0e1',
          '400': '#8eafd1',
          '500': '#6388be',
          '600': '#4d65a3',
          '700': '#444e84',
          '800': '#393e65',
          '900': '#2f3350',
        },
        wisteria: {
          '50': '#f6f7f7',
          '100': '#f2f1f2',
          '200': '#e4e2e7',
          '300': '#d3ccd7',
          '400': '#b6a8be',
          '500': '#987fa2',
          '600': '#7a5c83',
          '700': '#61476a',
          '800': '#4c3854',
          '900': '#3d2e43',
        },
        sepia: {
          '50': '#f8f8f6',
          '100': '#f6f2ee',
          '200': '#ede3dc',
          '300': '#e1ccc1',
          '400': '#cfa797',
          '500': '#bc7f6d',
          '600': '#9c5a4f',
          '700': '#794545',
          '800': '#5c363b',
          '900': '#492c32',
        },
        cooper: {
          '50': '#f8f8f6',
          '100': '#f6f2ed',
          '200': '#ece4d8',
          '300': '#e0cfb9',
          '400': '#ccab89',
          '500': '#b6845c',
          '600': '#966041',
          '700': '#74493b',
          '800': '#593935',
          '900': '#462f2d',
        },
        tan: {
          '50': '#f8f8f5',
          '100': '#f6f3eb',
          '200': '#ece6d2',
          '300': '#e0d2ae',
          '400': '#cab077',
          '500': '#b18a4a',
          '600': '#916533',
          '700': '#704d30',
          '800': '#563c2e',
          '900': '#443128',
        },
        asparagus: {
          '50': '#f7f8f5',
          '100': '#f4f4eb',
          '200': '#e8e9d3',
          '300': '#d7d6b0',
          '400': '#b6b77a',
          '500': '#92934d',
          '600': '#736f35',
          '700': '#5c5532',
          '800': '#49422f',
          '900': '#3a3529',
        },
        shadow: {
          '50': '#f7f8f6',
          '100': '#f2f3ee',
          '200': '#e4e8d9',
          '300': '#d1d6bb',
          '400': '#abb68d',
          '500': '#849261',
          '600': '#676e46',
          '700': '#54553e',
          '800': '#444237',
          '900': '#37352f',
        },
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/line-clamp'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
