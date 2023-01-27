import React, { PropsWithChildren } from "react"
import { SocketProvider } from "./SocketContext"

interface Props extends PropsWithChildren {
  contexts: any[]
}

const ProviderComposer: React.FC<Props> = ({ contexts, children }) => {
  return contexts.reduceRight(
    (kids, parent) =>
      React.cloneElement(parent, {
        children: kids,
      }),
    children,
  )
}
const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const contexts = [<SocketProvider />]

  return <ProviderComposer contexts={contexts}>{children}</ProviderComposer>
}

export default ContextProvider
