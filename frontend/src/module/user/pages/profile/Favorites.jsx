import { Link } from "react-router-dom"

import { Heart, Star, Clock, MapPin, Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import ScrollReveal from "../../components/ScrollReveal"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "../../context/ProfileContext"

export default function Favorites() {
  const { getFavorites, removeFavorite } = useProfile()
  const favorites = getFavorites()

  const handleRemoveFavorite = (e, slug) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Remove this restaurant from favorites?")) {
      removeFavorite(slug)
    }
  }

  if (favorites.length === 0) {
    return (
      <><AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/user/profile">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Favorites</h1>
        </div>
      </ScrollReveal>
      <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-4">You haven't added any favorites yet</p>
            <Link to="/user">
              <Button className="bg-gradient-to-r bg-primary-orange hover:opacity-90 text-white">
                Explore Restaurants
              </Button>
            </Link>
          </CardContent>
        </Card>
        </div>
      </AnimatedPage></>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/user/profile">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Favorites</h1>
                <p className="text-muted-foreground mt-1">
                  {favorites.length} {favorites.length === 1 ? "restaurant" : "restaurants"} saved
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((restaurant, index) => (
            <ScrollReveal key={restaurant.slug} delay={index * 0.1}>
              <Link to={`/user/restaurants/${restaurant.slug}`}>
                <Card className="overflow-hidden h-full">
                  <div className="h-48 w-full relative overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-red-500"
                        onClick={(e) => handleRemoveFavorite(e, restaurant.slug)}
                      >
                        <Heart className="h-5 w-5 fill-red-500" />
                      </Button>
                      <Badge className="bg-primary-orange text-white shadow-lg text-sm font-semibold px-3 py-1">
                        {restaurant.priceRange}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-sm">{restaurant.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <CardTitle className="text-lg font-bold mb-1">
                        {restaurant.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">
                        {restaurant.cuisine}
                      </p>
                      {restaurant.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {restaurant.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{restaurant.distance}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r bg-primary-orange hover:opacity-90 text-white">
                      View Restaurant
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </AnimatedPage>
  )
}
