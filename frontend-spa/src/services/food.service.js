import { API_BASE_URL, STATIC_BASE_URL } from '@/constants'

async function efetch(url, options = {}) {
  let result = {}
  let json = {}

  try {
    result = await fetch(url, options)
    json = await result.json()
  } catch (error) {
    throw new Error(error.message)
  }

  if (!result.ok || json.status !== 'success') {
    throw new Error(json.message || 'Request failed')
  }

  return json.data
}

function getFullFoodImageUrl(imagePath) {
  if (imagePath) {
    return `${STATIC_BASE_URL}${imagePath}`
  }
  return `${STATIC_BASE_URL}/public/images/default-food.png`
}

class FoodService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/foods`
  }

  async getAllFoods(params) {
    const queryParams = new URLSearchParams(params).toString()
    const data = await efetch(`${this.baseUrl}?${queryParams}`)
    
    // Xử lý URL hình ảnh cho tất cả foods
    if (data.foods && Array.isArray(data.foods)) {
      data.foods = data.foods.map((food) => ({
        ...food,
        image_url: getFullFoodImageUrl(food.image_url),
      }))
    }
    
    return data
  }

  async getFoodById(id) {
    const data = await efetch(`${this.baseUrl}/${id}`)
    
    // Xử lý URL hình ảnh cho food
    if (data.food) {
      data.food.image_url = getFullFoodImageUrl(data.food.image_url)
    }
    
    return data
  }
}

export default new FoodService() 