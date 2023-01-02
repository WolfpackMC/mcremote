import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { SessionProvider } from "next-auth/react"

import { trpc } from '../util/trpc'

const App = ({ Component, pageProps: {
  session,
  ...pageProps
} }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default trpc.withTRPC(App)
