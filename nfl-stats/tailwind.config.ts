import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        darkGreen: '#003300',
        mediumGreen: '#004d00',
        goldAccent: '#D4AF37',
        offWhite: '#F5F5F5',
        brown: '#5C4033',
        nflBlue: '#013369',
        nflRed: '#D50A0A',
        nflWhite: '#FFFFFF',
        nflGray: '#A5ACAF',
        nflBlack: '#000000',
        nflYellow: '#FFB612',
        nflGreen: '#00853D',
      },
    },
  },
}
export default config
