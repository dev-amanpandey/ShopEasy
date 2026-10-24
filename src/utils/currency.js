const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export const formatINR = (amount) => inrFormatter.format(Number(amount) || 0)
