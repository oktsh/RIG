export default function BracketCard({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative active-card border border-[#1a1a1a] p-6 ${className}`}>
      <div className="bracket-corner bl-tl" />
      <div className="bracket-corner bl-tr" />
      <div className="bracket-corner bl-br" />
      <div className="bracket-corner bl-bl" />
      {children}
    </div>
  )
}
