"use client"

interface CardBrandIconProps {
  brand: string
  className?: string
}

export function CardBrandIcon({ brand, className = "h-8 w-12" }: CardBrandIconProps) {
  const getBrandIcon = () => {
    switch (brand.toLowerCase()) {
      case "visa":
        return (
          <div className={`${className} rounded bg-[#1434CB] flex items-center justify-center p-1`}>
            <span className="text-white font-bold text-xs">VISA</span>
          </div>
        )
      case "mastercard":
        return (
          <div className={`${className} rounded bg-gradient-to-r from-[#EB001B] to-[#F79E1B] flex items-center justify-center p-1 relative overflow-hidden`}>
            <div className="absolute left-0 top-0 w-1/2 h-full bg-[#EB001B] rounded-l"></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[#F79E1B] rounded-r"></div>
            <div className="relative z-10 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
          </div>
        )
      case "amex":
      case "american express":
        return (
          <div className={`${className} rounded bg-[#006FCF] flex items-center justify-center p-1`}>
            <span className="text-white font-bold text-[10px]">AMEX</span>
          </div>
        )
      case "discover":
        return (
          <div className={`${className} rounded bg-[#FF6000] flex items-center justify-center p-1`}>
            <span className="text-white font-bold text-[9px]">DISCOVER</span>
          </div>
        )
      default:
        return (
          <div
            className={`${className} rounded bg-muted flex items-center justify-center border border-border`}
          >
            <span className="text-xs font-semibold text-muted-foreground">••••</span>
          </div>
        )
    }
  }

  return <div className="flex items-center">{getBrandIcon()}</div>
}
