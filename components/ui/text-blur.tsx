import { motion } from "framer-motion"
import { createElement } from "react"

interface TextBlurProps {
  text: string
  balise: string
  className?: string
}
export function BlurIn({ text, balise, className }: TextBlurProps) {
  const variants1 = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  }
  return createElement(
    motion[balise],
    {
      initial: "hidden",
      animate: "visible",
      transition: { duration: 1 },
      variants: variants1,
      className: className,
    },
    text
  )
}
