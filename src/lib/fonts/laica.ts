import localFont from 'next/font/local'

export const laica = localFont({
  src: [
    {
      path: '../../assets/fonts/laica/LaicaA-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/laica/LaicaA-Italic.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../assets/fonts/laica/LaicaA-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-laica',
  display: 'swap',
})
