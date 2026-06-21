import {
  Utensils, ShoppingBag, Scissors, Activity, Wrench, Pill, Coffee, Monitor, Star, Home, Store
} from 'lucide-react'

export const CAT_ICON: Record<string, React.ElementType> = {
  restaurant: Utensils, retail: ShoppingBag, salon: Scissors, clinic: Activity,
  auto_service: Wrench, bakery: Coffee, pharmacy: Pill, tailor: Scissors,
  cafe: Coffee, gym: Activity, electronics: Monitor, jewellery: Star,
  real_estate: Home, catering: Utensils,
}
